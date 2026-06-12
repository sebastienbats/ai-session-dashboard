const Cerebras = require('@cerebras/cerebras_cloud_sdk');

let cerebrasClient = null;
if (process.env.CEREBRAS_API_KEY) {
  cerebrasClient = new Cerebras({
    apiKey: process.env.CEREBRAS_API_KEY,
  });
}

// Modèles Cerebras disponibles
const AVAILABLE_MODELS = ['llama3.1-8b', 'gpt-oss-120b'];

async function callCerebras(messages, options = {}) {
  if (!process.env.CEREBRAS_API_KEY || !cerebrasClient) {
    throw new Error('CEREBRAS_API_KEY manquante');
  }

  const model = options.model || 'llama3.1-8b';

  try {
    const completion = await cerebrasClient.chat.completions.create({
      model: model,
      messages: messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 1000,
    });

    return {
      success: true,
      reply: completion.choices[0].message.content,
      tokensUsed: completion.usage.total_tokens,
      provider: 'Cerebras',
      model: model,
    };
  } catch (error) {
    console.error('Cerebras API error:', error.message);
    return {
      success: false,
      error: error.message,
      provider: 'Cerebras',
    };
  }
}

module.exports = { callCerebras };
