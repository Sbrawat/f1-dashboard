/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Base URL configuration (adjust based on your setup, e.g., Vite proxy or direct backend URL)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const SessionContext = createContext();

export const useSession = () => useContext(SessionContext);

export const SessionProvider = ({ children }) => {
    const [sessionData, setSessionData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNextSession = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/session/next`);
                
                if (response.data.success) {
                    setSessionData(response.data.data);
                } else {
                    setError(response.data.message || 'Failed to load session data.');
                }
            } catch (err) {
                console.error("Session Fetch Error:", err);
                setError('Could not connect to the race control server.');
            } finally {
                setLoading(false);
            }
        };

        fetchNextSession();
    }, []); // Empty dependency array ensures this runs only once on mount

    return (
        <SessionContext.Provider value={{ sessionData, loading, error }}>
            {children}
        </SessionContext.Provider>
    );
};