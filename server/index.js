import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import express from 'express';
import app from './app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 5000;
const HOST = '0.0.0.0';
const DIST_DIR = path.join(__dirname, '..', 'dist');

// Serve static client files if built
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));

  // SPA Fallback for client-side routing
  app.use((req, res) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return res.status(404).json({ error: 'Endpoint not found' });
    }
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
} else {
  // If dist is not yet built, provide a helpful health check and warning
  app.get('/', (_req, res) => {
    res.send('🌸 Sakura Birthday API server is active. Frontend build dist folder not detected.');
  });
}

// Start server
app.listen(PORT, HOST, () => {
  console.log(`🌸 Sakura Birthday Server is running on http://${HOST}:${PORT}`);
  console.log(`📡 API Healthcheck: http://${HOST}:${PORT}/api/health`);
});
