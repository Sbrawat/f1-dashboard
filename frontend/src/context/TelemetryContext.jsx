/* eslint-disable react-refresh/only-export-components */
import  { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

// If your API is http://localhost:5000/api, the socket server is at http://localhost:5000
const SOCKET_URL = import.meta.env.VITE_API_BASE_URL 
    ? import.meta.env.VITE_API_BASE_URL.replace('/api', '') 
    : 'http://localhost:5000';

const TelemetryContext = createContext();

export const useTelemetry = () => useContext(TelemetryContext);

export const TelemetryProvider = ({ children }) => {
    const [simStatus, setSimStatus] = useState('idle'); // idle, fetching_data, processing, live, completed
    const [simMessage, setSimMessage] = useState('');
    const [currentFrame, setCurrentFrame] = useState(null);
    const [error, setError] = useState(null);
    
    // We use a ref to persist the socket connection across renders without triggering useEffect
    const socketRef = useRef(null);

    useEffect(() => {
        // Initialize socket connection
        socketRef.current = io(SOCKET_URL);

        socketRef.current.on('sim_status', (data) => {
            setSimStatus(data.status);
            setSimMessage(data.message);
        });

        // The core data pipe
        socketRef.current.on('telemetry_frame', (frame) => {
            setCurrentFrame(frame);
        });

        socketRef.current.on('sim_error', (data) => {
            setError(data.message);
            setSimStatus('error');
        });

        // Crucial Cleanup: Disconnect socket when context unmounts
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);

    const startSimulation = (sessionKey) => {
        if (!socketRef.current) return;
        setError(null);
        setCurrentFrame(null);
        socketRef.current.emit('start_simulation', { sessionKey: Number(sessionKey) });
    };

    const stopSimulation = () => {
        if (!socketRef.current) return;
        socketRef.current.emit('stop_simulation');
        setSimStatus('idle');
        setCurrentFrame(null);
    };

    return (
        <TelemetryContext.Provider value={{ 
            simStatus, 
            simMessage, 
            currentFrame, 
            error, 
            startSimulation, 
            stopSimulation 
        }}>
            {children}
        </TelemetryContext.Provider>
    );
};