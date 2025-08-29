const express = require('express');
const cors = require('cors');
const serverless = require('serverless-http');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/route-command', (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Invalid or missing "message" in request body.' });
  }

  // Process the message (this is a placeholder; customize as needed)
  console.log('🔈 Received message:', message);
  return res.json({ response: `You said: ${message}` });
});

app.get('/', (req, res) => {
  res.send('Serverless Express app is running!');
});

module.exports.handler = serverless(app);

