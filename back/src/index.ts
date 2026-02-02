import express from 'express';
import cors from 'cors';
import { getAggregatedStatus } from './services/statusAggregator.js';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  ...(process.env.FRONT_ORIGIN ? process.env.FRONT_ORIGIN.split(',').map((o) => o.trim()) : []),
];

app.use(
  cors({
    origin: allowedOrigins.length ? allowedOrigins : true,
  })
);

app.get('/api/status', async (_req, res) => {
  try {
    const data = await getAggregatedStatus();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: 'Failed to fetch status',
      updatedAt: new Date().toISOString(),
      services: [],
    });
  }
});

app.listen(PORT, () => {
  console.log(`NOC back listening on http://localhost:${PORT}`);
});
