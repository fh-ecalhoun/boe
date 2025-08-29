const { Pinecone } = require('@pinecone-database/pinecone');

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

(async () => {
  const indexName = process.env.PINECONE_INDEX_NAME || 'boe-commands';

  try {
    console.log(`🛠 Creating index: ${indexName}...`);

    const existingIndexes = await pinecone.listIndexes();
    const exists = existingIndexes.indexes.find(i => i.name === indexName);

    if (exists) {
      console.log(`ℹ️ Index "${indexName}" already exists.`);
    } else {
      await pinecone.createIndex({
        name: indexName,
        dimension: 1536,
        metric: 'cosine',
        spec: {
          serverless: {
            cloud: 'aws',
            region: 'us-east-1',
          },
        },
      });
      console.log(`✅ Index "${indexName}" created.`);
    }
  } catch (err) {
    console.error('❌ Failed to create index:', err.message);
    process.exit(1);
  }
})();

