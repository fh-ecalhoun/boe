const { OpenAIEmbeddings } = require('@langchain/openai');
const { PineconeStore } = require('@langchain/community/vectorstores/pinecone');
const { pinecone } = require('./pinecone-init');
const { Configuration, OpenAI } = require('openai');

module.exports.similarCommand = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const prompt = body.prompt;

    if (!prompt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing prompt' }),
      };
    }

    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    const index = pinecone.Index(process.env.PINECONE_INDEX_NAME);

    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex: index,
    });

    const results = await vectorStore.similaritySearch(prompt, 1);

    return {
      statusCode: 200,
      body: JSON.stringify({
        result: results?.[0]?.pageContent || 'No similar command found',
      }),
    };
  } catch (err) {
    console.error('❌ Failed to search index:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Search failed', details: err.message }),
    };
  }
};

