import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http'; 

// Import Routes
import sessionRoutes from './routes/sessionRoutes.js';
import weatherRoutes from './routes/weatherRoutes.js';
import raceRoutes from './routes/raceRoutes.js'; // NEW: Import the race routes

// Import Live-Sim Engine
import { initializeTelemetryStream } from './services/telemetryStreamService.js';

dotenv.config();

const app = express();
const httpServer = createServer(app); 

// Middleware
app.use(cors());
app.use(express.json());

// Mount Routes
app.use('/api/session', sessionRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/races', raceRoutes); // NEW: Mount the race routes

// Initialize WebSocket Engine
initializeTelemetryStream(httpServer);

const PORT = process.env.PORT || 5000;

// Remember to listen on httpServer, not app, to support the WebSockets!
httpServer.listen(PORT, () => {
    console.log(`Server & Live-Sim Engine running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});