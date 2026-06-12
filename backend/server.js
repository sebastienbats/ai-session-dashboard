require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { callWithFallback, getActiveProviders } = require('./src/fallback');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Informations du modèle (sera mis à jour dynamiquement après chaque appel)
let currentModelInfo = {
  model: "Multi-provider (fallback)",
  version: "Dynamique",
  provider: "Groq/Cerebras/GitHub/Algion/Ollama"
};

// Stockage des tokens par session
let sessions = {};

app.use((req, res, next) => {
  let sessionId = req.headers['x-session-id'];
  if (!sessionId) sessionId = 'default-session';
  if (!sessions[sessionId]) {
    sessions[sessionId] = { totalTokens: 0, history: [] };
  }
  req.sessionId = sessionId;
  next();
});

// Endpoint pour récupérer les infos du modèle et la liste des fournisseurs actifs
app.get('/api/current-model', (req, res) => {
  res.json({
    model: currentModelInfo.model,
    version: currentModelInfo.version,
    provider: currentModelInfo.provider,
    activeProviders: getActiveProviders()
  });
});

app.get('/api/tokens', (req, res) => {
  res.json({ tokens: sessions[req.sessionId].totalTokens });
});

app.get('/api/token-history', (req, res) => {
  res.json({ history: sessions[req.sessionId].history });
});

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Message manquant" });

  const messages = [
    { role: "system", content: "Vous êtes un assistant utile." },
    { role: "user", content: message }
  ];

  const result = await callWithFallback(messages);

  if (!result.success) {
    console.error('Fallback complet a échoué:', result.details);
    return res.status(503).json({ 
      error: "Service temporairement indisponible", 
      details: result.details 
    });
  }

  // Mise à jour des informations du modèle avec le fournisseur qui a répondu
  currentModelInfo = {
    model: result.model,
    version: "via API",
    provider: result.provider
  };

  const session = sessions[req.sessionId];
  session.totalTokens += result.tokensUsed;

  session.history.push({
    id: Date.now() + Math.random(),
    timestamp: new Date().toISOString(),
    message: message.length > 50 ? message.substring(0, 47) + '...' : message,
    tokensUsed: result.tokensUsed,
    provider: result.provider  // Ajout du fournisseur utilisé dans l'historique
  });

  res.json({
    reply: result.reply,
    tokensUsed: result.tokensUsed,
    totalTokens: session.totalTokens,
    provider: result.provider,
    model: result.model
  });
});

app.post('/api/reset-tokens', (req, res) => {
  sessions[req.sessionId] = { totalTokens: 0, history: [] };
  res.json({ tokens: 0 });
});

app.listen(PORT, () => {
  console.log(`Backend démarré sur http://localhost:${PORT}`);
  console.log(`Fournisseurs actifs: ${getActiveProviders().join(', ')}`);
});
