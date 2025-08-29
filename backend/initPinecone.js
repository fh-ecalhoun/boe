const { OpenAI } = require('openai');
const { Pinecone } = require('@pinecone-database/pinecone');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

const INDEX_NAME = 'boe-intents';

async function init() {
  const indexList = await pc.listIndexes();
  const indexNames = indexList?.indexes?.map(i => i.name) || [];

  if (!indexNames.includes(INDEX_NAME)) {
    console.log('🛠 Creating Pinecone index...');
    await pc.createIndex({
      name: INDEX_NAME,
      dimension: 1536,
      metric: 'cosine',
      spec: {
        serverless: {
          cloud: 'aws',
          region: 'us-east-1'
        }
      }
    });

    // Wait for index to become ready
    let isReady = false;
    while (!isReady) {
      const updated = await pc.describeIndex(INDEX_NAME);
      if (updated.status?.ready) isReady = true;
      else {
        console.log('⏳ Waiting for index to be ready...');
        await new Promise(r => setTimeout(r, 3000));
      }
    }
  } else {
    console.log('✅ Pinecone index already exists.');
  }

  const pineconeIndex = pc.index(INDEX_NAME);

  const examples = [
    {
      id: '1',
      text: 'Play some jazz music',
      metadata: { intent: 'play_music', tags: ['music', 'genre'] }
    },
    {
      id: '2',
      text: 'Schedule a meeting with Sarah at 3PM',
      metadata: { intent: 'schedule_meeting', tags: ['calendar'] }
    },
    {
      id: '3',
      text: 'What’s the weather in New York tomorrow?',
      metadata: { intent: 'get_weather', tags: ['weather'] }
    }
  ];

  console.log('📦 Generating embeddings and upserting...');
  const embeddings = await Promise.all(
    examples.map(async (example) => {
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: example.text
      });

      return {
        id: example.id,
        values: response.data[0].embedding,
        metadata: example.metadata
      };
    })
  );

  await pineconeIndex.upsert(embeddings);
  console.log('✅ Pinecone index is ready and populated.');
}

init().catch((err) => {
  console.error('❌ Error during Pinecone setup:', err.message);
});

