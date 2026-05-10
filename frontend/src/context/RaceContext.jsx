/* eslint-disable react-refresh/only-export-components */
import  { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Base URL configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const RaceContext = createContext();

export const useRace = () => useContext(RaceContext);

export const RaceProvider = ({ children }) => {
    const [calendar, setCalendar] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCalendar = async () => {
            try {
                // Fetching the calendar. You can pass ?year=2023 here if you want to hardcode a past season,
                // but our backend defaults to the current year seamlessly.
                const response = await axios.get(`${API_BASE_URL}/races/calendar`);
                
                if (response.data.success) {
                    setCalendar(response.data.data);
                    setError(null);
                } else {
                    setError(response.data.message || 'Failed to load the season calendar.');
                }
            } catch (err) {
                console.error("Race Calendar Fetch Error:", err);
                setError('Unable to connect to the historical archives.');
            } finally {
                setLoading(false);
            }
        };

        fetchCalendar();
    }, []);

    /**
     * Helper function to be used by the Live-Sim view.
     * When the URL changes to /sim/9158, the sim view can pass '9158' into this 
     * function to instantly get the country, circuit name, and date for the UI header.
     */
    const getRaceMetadata = (sessionKey) => {
        if (!calendar || calendar.length === 0) return null;
        // Ensure type matching, as URL params are strings but session_keys are numbers
        return calendar.find(race => race.session_key === Number(sessionKey)) || null;
    };

    return (
        <RaceContext.Provider value={{ calendar, loading, error, getRaceMetadata }}>
            {children}
        </RaceContext.Provider>
    );
};