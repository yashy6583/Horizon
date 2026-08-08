import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import interviewRouter from './routes/interview';
import dataRouter from './routes/data';
import { initDatabase } from './db/database';

dotenv.config();

// Initialize SQLite Database
initDatabase();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
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

// Serve frontend static assets if dist exists
const frontendDist = path.join(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
} else {
  // 404
  app.use((_req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });
}

app.listen(PORT, () => {
  const apiKey = process.env.OPENAI_API_KEY;
  const isLiveMode = apiKey && apiKey.length > 10 && apiKey !== 'your-openai-api-key-here';
  console.log(`\n🚀 AI Interview Agent Backend`);
  console.log(`   Port:  ${PORT}`);
  console.log(`   Mode:  ${isLiveMode ? '✅ Live (OpenAI)' : '🎭 Demo (Mock AI)'}`);
  console.log(`   Health: http://localhost:${PORT}/health\n`);
});

export default app;
