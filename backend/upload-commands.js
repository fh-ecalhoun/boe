// upload-commands.js
const OpenAI = require('openai');
const { Pinecone } = require('@pinecone-database/pinecone');

// Init OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Init Pinecone
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pinecone.index(process.env.PINECONE_INDEX);

// Sample commands
const commands = [
  { id: 'send_contract', text: 'Send the contract at 4pm' },
  { id: 'schedule_meeting', text: 'Schedule a meeting for tomorrow at 10am' },
  { id: 'play_music', text: 'Play some relaxing jazz music' },
  { id: 'open_calendar', text: 'Open my calendar for next week' },
  { id: 'set_reminder', text: 'Remind me to call mom tonight' }
];

(async () => {
  try {
    console.log('📦 Creating embeddings and uploading to Pinecone...');

    const upserts = [];

    for (const command of commands) {
      const response = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: command.text
      });

      const embedding = response.data[0].embedding;

      upserts.push({
        id: command.id,
        values: embedding,
        metadata: { text: command.text }
      });
    }

    await index.upsert(upserts);
    console.log('✅ Uploaded commands to Pinecone index:', process.env.PINECONE_INDEX);
  } catch (err) {
    console.error('❌ Upload failed:', err.message);
  }
})();

