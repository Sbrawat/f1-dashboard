import { Server } from 'socket.io';
import { getIntervals, getTrackPositions } from './openF1Service.js';

let io;

// We use a Map to track active simulation intervals per connected client.
// This is strictly required to prevent catastrophic memory leaks if a user refreshes or disconnects.
const activeSimulations = new Map();

/**
 * Initializes the WebSocket server and attaches it to the Node HTTP server.
 * @param {Object} httpServer - The raw Node HTTP server instance
 */
export const initializeTelemetryStream = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Adjust for your Vite port
            methods: ['GET', 'POST']
        }
    });

    io.on('connection', (socket) => {
        console.log(`📡 Pit-wall connected: ${socket.id}`);

        // Listen for the frontend requesting a specific race simulation
        socket.on('start_simulation', async ({ sessionKey }) => {
            console.log(`Starting simulation for session ${sessionKey} on socket ${socket.id}`);

            // 1. Cleanup any existing simulation for this client before starting a new one
            stopSimulation(socket.id);

            try {
                // Let the frontend know we are fetching the heavy data
                socket.emit('sim_status', { status: 'fetching_data', message: 'Downloading telemetry archives...' });

                // Fetch the raw data using the service we built in Task 3.1
                const [rawIntervals, rawPositions] = await Promise.all([
                    getIntervals(sessionKey),
                    getTrackPositions(sessionKey)
                ]);

                socket.emit('sim_status', { status: 'processing', message: 'Calibrating simulation engine...' });

                // 2. Data Processing: Group the linear array of telemetry by timestamp (date)
                // This creates "frames" of data, exactly like a movie reel.
                const frames = buildSimulationFrames(rawIntervals, rawPositions);

                if (frames.length === 0) {
                    socket.emit('sim_error', { message: 'No telemetry data available for this session.' });
                    return;
                }

                socket.emit('sim_status', { status: 'live', message: 'Simulation running.' });

                // 3. The Live-Sim Engine Loop
                let currentFrameIndex = 0;
                
                const simInterval = setInterval(() => {
                    if (currentFrameIndex >= frames.length) {
                        // End of race
                        socket.emit('sim_status', { status: 'completed', message: 'Checkered flag.' });
                        stopSimulation(socket.id);
                        return;
                    }

                    // Broadcast the current frame down the websocket
                    socket.emit('telemetry_frame', frames[currentFrameIndex]);
                    currentFrameIndex++;

                }, 1000); // Emits a new frame every 1 second (1000ms)

                // Store the interval ID so we can kill it later
                activeSimulations.set(socket.id, simInterval);

            } catch (error) {
                console.error('Simulation Error:', error);
                socket.emit('sim_error', { message: 'Failed to initialize simulation engine.' });
            }
        });

        // Listen for explicit stop requests from the frontend (e.g., user clicked "Back")
        socket.on('stop_simulation', () => {
            stopSimulation(socket.id);
        });

        // Crucial Cleanup: Client closed the tab or lost connection
        socket.on('disconnect', () => {
            console.log(`🔌 Pit-wall disconnected: ${socket.id}`);
            stopSimulation(socket.id);
        });
    });
};

/**
 * Helper: Kills the interval loop for a specific socket to free up server memory.
 * @param {string} socketId 
 */
const stopSimulation = (socketId) => {
    if (activeSimulations.has(socketId)) {
        clearInterval(activeSimulations.get(socketId));
        activeSimulations.delete(socketId);
        console.log(`Stopped simulation for socket ${socketId}`);
    }
};

/**
 * Helper: Chunks the massive linear OpenF1 data arrays into chronological "frames"
 * based on unique timestamps.
 */
const buildSimulationFrames = (intervals, positions) => {
    // 1. Find all unique timestamps across the data
    const timestamps = new Set([
        ...intervals.map(i => i.date),
        ...positions.map(p => p.date)
    ]);

    // Sort chronologically
    const sortedTimestamps = Array.from(timestamps).sort((a, b) => new Date(a) - new Date(b));

    // 2. Map data to each timestamp to create a frame
    return sortedTimestamps.map(time => {
        return {
            timestamp: time,
            intervals: intervals.filter(i => i.date === time),
            positions: positions.filter(p => p.date === time)
        };
    });
};