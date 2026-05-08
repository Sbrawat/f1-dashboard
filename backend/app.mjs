import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http'; // Standard Node.js module
// Import Routes
import sessionRoutes from './routes/sessionRoutes.js';
import weatherRoutes from './routes/weatherRoutes.js';
import { initializeTelemetryStream } from './services/telemetryStreamService.js';

dotenv.config();

const app = express();
// Create a raw HTTP server wrapping the Express app
const httpServer = createServer(app);

// Middleware
// Enable CORS so the React frontend can request data from a different port
app.use(cors());
app.use(express.json());

// Pull the connection string from Docker's environment variables
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/f1dashboard';

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// The Status Endpoint
app.get('/api/status', (req, res) => {
    // Check Mongoose's internal state (0 = disconnected, 1 = connected)
    const dbState = mongoose.connection.readyState;
    const statusMap = { 0: 'Disconnected', 1: 'Connected', 2: 'Connecting', 3: 'Disconnecting' };
    
    res.json({ 
        source: 'Node.js Backend',
        message: 'Hello World! The backend is active. 🏎️',
        databaseStatus: statusMap[dbState] || 'Unknown'
    });
});

// Mount Routes
// This tells Express: "Any request starting with /api/session, use sessionRoutes"
app.use('/api/session', sessionRoutes);
app.use('/api/weather', weatherRoutes);
initializeTelemetryStream(httpServer);

const PORT = process.env.PORT || 5000;

// CRITICAL: Call .listen() on the httpServer, NOT the express app
httpServer.listen(PORT, () => {
    console.log(`Server & Live-Sim Engine running on port ${PORT}`);
});