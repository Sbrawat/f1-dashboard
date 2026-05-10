/* eslint-disable react-refresh/only-export-components */
import  { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

// Automatically strip '/api' if present to get the root server URL for Socket.io
const SOCKET_URL = import.meta.env.VITE_API_BASE_URL 
    ? import.meta.env.VITE_API_BASE_URL.replace('/api', '') 
    : 'http://localhost:5000';

const TelemetryContext = createContext();

export const useTelemetry = () => useContext(TelemetryContext);

export const TelemetryProvider = ({ children }) => {
    // Standard UI States
    const [simStatus, setSimStatus] = useState('idle'); // 'idle', 'fetching_data', 'processing', 'live', 'completed', 'error'
    const [simMessage, setSimMessage] = useState('');
    const [currentFrame, setCurrentFrame] = useState(null);
    const [error, setError] = useState(null);
    
    // We use a ref to persist the socket connection across renders.
    // If we used useState for the socket, updating it would trigger a re-render,
    // which could accidentally re-trigger the useEffect and spawn duplicate connections.
    const socketRef = useRef(null);

    useEffect(() => {
        // 1. Establish the connection when the Provider mounts
        socketRef.current = io(SOCKET_URL, {
            autoConnect: true,
            reconnection: true,
        });

        // 2. Attach Event Listeners
        socketRef.current.on('sim_status', (data) => {
            setSimStatus(data.status);
            setSimMessage(data.message);
        });

        socketRef.current.on('telemetry_frame', (frame) => {
            setCurrentFrame(frame);
        });

        socketRef.current.on('sim_error', (data) => {
            setError(data.message);
            setSimStatus('error');
            // Auto-kill the connection on fatal backend error
            if (socketRef.current) socketRef.current.disconnect(); 
        });

        // 3. THE CRUCIAL CLEANUP FUNCTION
        // This triggers exactly when the user navigates completely away from the app
        // or if the Provider is ever unmounted from the DOM.
        return () => {
            if (socketRef.current) {
                console.log('🧹 Unmounting context: Terminating socket connection.');
                socketRef.current.emit('stop_simulation'); // Politely tell backend to stop the loop
                socketRef.current.disconnect();            // Sever the TCP connection
                socketRef.current = null;                  // Clear the ref memory
            }
        };
    }, []); // Empty array ensures this setup/teardown only happens exactly once

    // Manual control methods exposed to the UI components
    const startSimulation = (sessionKey) => {
        if (!socketRef.current || !socketRef.current.connected) {
             socketRef.current.connect();
        }
        setError(null);
        setCurrentFrame(null);
        socketRef.current.emit('start_simulation', { sessionKey: Number(sessionKey) });
    };

    const stopSimulation = () => {
        if (socketRef.current) {
            socketRef.current.emit('stop_simulation');
        }
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