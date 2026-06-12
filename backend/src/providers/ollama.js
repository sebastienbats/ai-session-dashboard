const ollama = require('ollama');

// Configuration Ollama (local)
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';

async function callOllama(messages, options = {}) {
  const model = options.model || process.env.OLLAMA_MODEL || 'llama3.2';
  
  try {
    const response = await ollama.chat({
      model: model,
      messages: messages,
      options: {
        temperature: options.temperature || 0.7,
        num_predict: options.maxTokens || 1000,
      },
      host: OLLAMA_HOST,
    });

    // Estimation approximative des tokens (car Ollama ne les fournit pas directement)
    const estimatedTokens = Math.ceil(JSON.stringify(messages).length / 4) + 
                           Math.ceil(response.message.content.length / 4);

    return {
      success: true,
      reply: response.message.content,
      tokensUsed: estimatedTokens,
      provider: 'Ollama (local)',
      model: model,
    };
  } catch (error) {
    console.error('Ollama error:', error.message);
    return {
      success: false,
      error: error.message,
      provider: 'Ollama (local)',
    };
  }
}

module.exports = { callOllama };
