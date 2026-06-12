const OpenAI = require('openai');

let algionClient = null;
if (process.env.ALGION_API_KEY) {
  algionClient = new OpenAI({
    apiKey: process.env.ALGION_API_KEY,
    baseURL: 'https://api.algion.dev/v1',
  });
}

// Modèles Algion disponibles
const ALGION_MODELS = [
  'gpt-5.1',
  'gpt-5',
  'gpt-5-minic',
  'gpt-4.1',
  'gpt-4o',
  'gpt-4o-mini',
  'claude-sonnet-4.5',
  'claude-haiku-4.5',
  'gemini-2.5-pro',
];

async function callAlgion(messages, options = {}) {
  if (!process.env.ALGION_API_KEY || !algionClient) {
    throw new Error('ALGION_API_KEY manquante (obtenez-la via @AlgionBot sur Telegram)');
  }

  const model = options.model || 'gpt-4o-mini';

  try {
    const completion = await algionClient.chat.completions.create({
      model: model,
      messages: messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 1000,
    });

    return {
      success: true,
      reply: completion.choices[0].message.content,
      tokensUsed: completion.usage.total_tokens,
      provider: 'Algion',
      model: model,
    };
  } catch (error) {
    console.error('Algion API error:', error.message);
    return {
      success: false,
      error: error.message,
      provider: 'Algion',
    };
  }
}

module.exports = { callAlgion };
