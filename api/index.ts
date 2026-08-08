import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import interviewRouter from '../backend/src/routes/interview';
import dataRouter from '../backend/src/routes/data';
import { initDatabase } from '../backend/src/db/database';

dotenv.config();

// Initialize Database
initDatabase();

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '1mb' }));

// Request logging
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/interview', interviewRouter);
app.use('/api', dataRouter);

// Health check
app.get('/health', (_req, res) => {
  const apiKey = process.env.OPENAI_API_KEY;
  const isLiveMode = apiKey && apiKey.length > 10 && apiKey !== 'your-openai-api-key-here';
  res.json({
    status: 'ok',
    mode: isLiveMode ? 'live' : 'demo',
    timestamp: new Date().toISOString(),
  });
});

// 404
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

export default app;
