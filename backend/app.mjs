import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http'; 

// Import Routes
import sessionRoutes from './routes/sessionRoutes.js';
import weatherRoutes from './routes/weatherRoutes.js';
import raceRoutes from './routes/raceRoutes.js'; // NEW: Import the race routes

// Import Live-Sim Engine
// import { initializeTelemetryStream } from './services/telemetryStreamService.js';
import connectDB from './db/connect.js';
import axios from 'axios';

dotenv.config();

// Connect to MongoDB
connectDB();

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

// const dataObject = await axios.get("https://api.openf1.org/v1/location?session_key=11234&driver_number=81");
// console.log("printing something", dataObject);

// initializeTelemetryStream(httpServer);


const PORT = process.env.PORT || 5000;

// Remember to listen on httpServer, not app, to support the WebSockets!
httpServer.listen(PORT, () => {
    console.log(`Server & Live-Sim Engine running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});