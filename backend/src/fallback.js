// Ordre de fallback : services cloud gratuits en priorité, puis local en dernier recours
const PROVIDER_ORDER = [
  { name: 'Groq', provider: require('./providers/groq'), call: 'callGroq', config: { model: 'llama-3.3-70b-versatile' } },
  { name: 'Cerebras', provider: require('./providers/cerebras'), call: 'callCerebras', config: { model: 'llama3.1-8b' } },
  { name: 'Algion', provider: require('./providers/algion'), call: 'callAlgion', config: { model: 'gpt-4o-mini' } },
  { name: 'Ollama', provider: require('./providers/ollama'), call: 'callOllama', config: { model: process.env.OLLAMA_MODEL || 'llama3.2' } },
];

async function callWithFallback(messages, options = {}) {
  const errors = [];
  
  for (const provider of PROVIDER_ORDER) {
    // Vérifier si le fournisseur a une clé API configurée (sauf Ollama)
    if (provider.name !== 'Ollama' && !process.env[`${provider.name.toUpperCase()}_API_KEY`]) {
      console.log(`⚠️ ${provider.name} : clé API manquante, fournisseur ignoré`);
      continue;
    }
    
    console.log(`🔄 Tentative avec ${provider.name}...`);
    
    try {
      const result = await provider.provider[provider.call](messages, {
        ...provider.config,
        ...options,
      });
      
      if (result.success) {
        console.log(`✅ Succès avec ${provider.name}`);
        return result;
      } else {
        console.log(`❌ ${provider.name} a échoué : ${result.error}`);
        errors.push({ provider: provider.name, error: result.error });
      }
    } catch (error) {
      console.log(`❌ ${provider.name} a échoué : ${error.message}`);
      errors.push({ provider: provider.name, error: error.message });
    }
  }
  
  return {
    success: false,
    error: "Tous les fournisseurs ont échoué",
    details: errors,
  };
}

// Fonction pour obtenir la liste des fournisseurs actifs
function getActiveProviders() {
  return PROVIDER_ORDER.filter(provider => {
    if (provider.name === 'Ollama') return true;
    return !!process.env[`${provider.name.toUpperCase()}_API_KEY`];
  }).map(p => p.name);
}

module.exports = { callWithFallback, getActiveProviders };
