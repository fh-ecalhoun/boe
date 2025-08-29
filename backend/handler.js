const OpenAI = require("openai");
const { Pinecone } = require("@pinecone-database/pinecone");

// 🔑 Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 🔑 Initialize Pinecone client (NO "environment" here!)
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

// 🔍 Get Pinecone index
const index = pinecone.index(process.env.PINECONE_INDEX);

module.exports.hello = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "✅ BOE backend is working!",
      input: event,
    }),
  };
};

module.exports.intent = async (event) => {
  const body = JSON.parse(event.body || '{}');
  const userInput = body.prompt || '';

  if (!userInput) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing prompt" }),
    };
  }

  const systemMessage = `You are an AI assistant for a unified smart device platform.
Classify the user's input into:
- intent: (e.g., play_music, get_weather, control_devices, schedule_event, general_question)
- action: a 1-2 word description of what to do
- details: what's being asked
- raw: the original user input
Return it as a JSON object.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userInput }
      ],
      temperature: 0.2,
    });

    const rawOutput = response.choices[0].message.content.trim();

    // Attempt to parse the response into a JSON object
    let parsed;
    try {
      parsed = JSON.parse(rawOutput);
    } catch (e) {
      // Fallback: clean Markdown-style output
      parsed = JSON.parse(
        rawOutput
          .replace(/^```json/, '')
          .replace(/^```/, '')
          .replace(/```$/, '')
          .trim()
      );
    }

    return {
      statusCode: 200,
      body: JSON.stringify(parsed),
      headers: {
        "Content-Type": "application/json"
      }
    };

  } catch (err) {
    console.error("❌ OpenAI error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "OpenAI request failed", details: err.message }),
    };
  }
};

module.exports.similarCommand = async (event) => {
  const body = JSON.parse(event.body || '{}');
  const userInput = body.prompt || '';

  if (!userInput) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing prompt" }),
    };
  }

  try {
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: userInput,
    });

    const userVector = embeddingResponse.data[0].embedding;

    const searchResponse = await index.query({
      vector: userVector,
      topK: 1,
      includeMetadata: true,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        match: searchResponse.matches?.[0] || null,
        query: userInput,
      }),
    };
  } catch (err) {
    console.error("❌ Pinecone error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Search failed", details: err.message }),
    };
  }
};

