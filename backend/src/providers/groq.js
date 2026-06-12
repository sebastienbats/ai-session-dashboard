const OpenAI = require('openai');

// Configuration Groq Cloud - API compatible OpenAI
const groqClient = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

// Liste des modèles disponibles
const MODEL_IDS = {
  'llama-3.3-70b-versatile': 'llama3-70b-8192',
  'llama-3.1-8b-instant': 'llama3.1-8b-8192',
  'mixtral-8x7b-32768': 'mixtral-8x7b-32768',
  'gemma2-9b-it': 'gemma2-9b-it',
};

async function callGroq(messages, options = {}) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY manquante');
  }

  const model = options.model || 'llama-3.3-70b-versatile';
  const groqModelId = MODEL_IDS[model] || 'llama3-70b-8192';

  try {
    const completion = await groqClient.chat.completions.create({
      model: groqModelId,
      messages: messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 1000,
    });

    return {
      success: true,
      reply: completion.choices[0].message.content,
      tokensUsed: completion.usage.total_tokens,
      provider: 'Groq Cloud',
      model: model,
    };
  } catch (error) {
    console.error('Groq API error:', error.message);
    return {
      success: false,
      error: error.message,
      provider: 'Groq Cloud',
    };
  }
}

module.exports = { callGroq };
