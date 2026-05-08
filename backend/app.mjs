// backend/index.js
import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors';


const app = express();

// Enable CORS so the React frontend can request data from a different port
app.use(cors());

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));