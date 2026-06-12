const { githubModels } = require('@github/models');
const { generateText } = require('ai');

// Configuration GitHub Models
const GITHUB_MODELS = {
  'meta-llama-3.1-8b-instruct': 'meta/meta-llama-3.1-8b-instruct',
  'meta-llama-3.1-70b-instruct': 'meta/meta-llama-3.1-70b-instruct',
  'mistral-large-2': 'mistral/mistral-large-2',
  'gpt-4o-mini': 'openai/gpt-4o-mini',
};

async function callGitHub(messages, options = {}) {
  if (!process.env.GITHUB_TOKEN) {
    throw new Error('GITHUB_TOKEN manquante');
  }

  const model = options.model || 'meta-llama-3.1-8b-instruct';
  const githubModelId = GITHUB_MODELS[model] || 'meta/meta-llama-3.1-8b-instruct';
  
  // Convertir les messages au format attendu
  const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n');

  try {
    const result = await generateText({
      model: githubModels(githubModelId),
      prompt: prompt,
      temperature: options.temperature || 0.7,
      maxTokens: options.maxTokens || 1000,
    });

    return {
      success: true,
      reply: result.text,
      tokensUsed: result.usage?.totalTokens || 0,
      provider: 'GitHub Models',
      model: model,
    };
  } catch (error) {
    console.error('GitHub Models error:', error.message);
    return {
      success: false,
      error: error.message,
      provider: 'GitHub Models',
    };
  }
}

module.exports = { callGitHub };
