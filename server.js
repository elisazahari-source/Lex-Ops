import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const distPath = path.resolve(__dirname, 'dist');

// Serve static assets from Vite build output directory
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// Health check endpoint for Cloud Run container probes
app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

// Single Page Application (SPA) routing fallback
app.get('*', (req, res) => {
  const indexPath = path.resolve(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(200).send('LexOps Legal Management System is starting...');
  }
});

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`[LexOps] Production server listening on 0.0.0.0:${PORT}`);
});
