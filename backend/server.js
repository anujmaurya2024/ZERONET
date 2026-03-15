import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import { v4 as uuidv4 } from 'uuid';
import os from 'os';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import apiRoutes from './routes/api.js';
import { setupSignaling } from './sockets/signaling.js';
import { startBonjour, stopBonjour } from './services/bonjour.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const httpServer = createServer(app);

const PORT = process.env.PORT || 3001;

// Generate persistent device ID (stored in memory for this session)
const deviceId = uuidv4();
const deviceName = os.hostname() || 'Zeronet Device';

app.use(helmet({
  contentSecurityPolicy: false, // Allow WebSocket connections
  crossOriginEmbedderPolicy: false,
}));
app.use(cors({ origin: true }));
app.use(express.json());

// REST API routes
app.use('/api', apiRoutes(deviceId, deviceName));

// Serve frontend in production (optional)
app.use(express.static(join(__dirname, '../frontend/dist')));

// Socket.IO signaling
const io = new Server(httpServer, {
  cors: { origin: true },
  pingTimeout: 60000,
  pingInterval: 25000,
});

setupSignaling(io);

// Start server
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Zeronet server running at http://0.0.0.0:${PORT}`);
  startBonjour(PORT);
});

// Graceful shutdown
process.on('SIGINT', () => {
  stopBonjour();
  httpServer.close();
  process.exit(0);
});

export { deviceId, deviceName };
