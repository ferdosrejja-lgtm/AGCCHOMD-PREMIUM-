import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const port = process.env.PORT || 3000;
const apiKey = process.env.OPENAI_API_KEY;
const client = apiKey ? new OpenAI({ apiKey }) : null;

const instructions = {
  ask: 'Answer the user clearly and helpfully. If unsure, say so. Use the user\\'s language when practical.',
  math: 'You are a patient math tutor. Solve the problem step by step, show the key calculations, and verify the result.',
  code: 'You are an expert programming tutor. Explain code clearly, diagnose errors, provide corrected examples, and mention assumptions.',
  learn: 'You are a friendly coding teacher for beginners. Teach in small steps, explain terms simply, and include short runnable examples.'
};

app.get('/health', (_req, res) => res.json({ ok: true, service: 'Agcchomd AI backend' }));

app.post('/api/chat', async (req, res) => {
  try {
    if (!client) return res.status(503).json({ error: 'Backend is missing OPENAI_API_KEY. Add it to backend/.env and restart.' });
    const { mode = 'ask', messages = [] } = req.body ?? {};
    if (!Array.isArray(messages) || messages.length === 0) return res.status(400).json({ error: 'Please provide a question.' });
    const safeMode = Object.hasOwn(instructions, mode) ? mode : 'ask';
    const cleanMessages = messages.slice(-20).map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: String(m.content ?? '').slice(0, 12000)
    }));
    const result = await client.responses.create({
      model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
      instructions: instructions[safeMode],
      input: cleanMessages
    });
    res.json({ answer: result.output_text || 'I could not generate a response. Please try again.' });
  } catch (error) {
    console.error('AI request failed:', error?.message || error);
    res.status(500).json({ error: 'AI request failed. Check the server logs and API account configuration.' });
  }
});

app.listen(port, '0.0.0.0', () => console.log(`Agcchomd backend listening on port ${port}`));
