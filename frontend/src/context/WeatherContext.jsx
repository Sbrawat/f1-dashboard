/* eslint-disable react-refresh/only-export-components */
import  { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useSession } from './SessionContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const WeatherContext = createContext();

export const useWeather = () => useContext(WeatherContext);

export const WeatherProvider = ({ children }) => {
    const { sessionData } = useSession(); 
    
    const [weatherData, setWeatherData] = useState(null);
    // 1. Rename to an internal fetching state
    const [isFetching, setIsFetching] = useState(true); 
    const [error, setError] = useState(null);

    // 2. DERIVE the final loading state during the render cycle!
    // If the season is over (indicated by a message), we are inherently NOT loading weather.
    const isSeasonOver = !!sessionData?.message;
    const loading = isSeasonOver ? false : isFetching;

    useEffect(() => {
        // 3. The effect is now beautifully clean. 
        // If we don't have coordinates, just bail out. The derived state handles the UI!
        if (!sessionData?.coordinates) {
            return;
        }

        const { latitude, longitude } = sessionData.coordinates;

        const fetchWeather = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/weather/current`, {
                    params: { lat: latitude, lon: longitude }
                });

                if (response.data.success) {
                    setWeatherData(response.data.data);
                    setError(null); 
                } else {
                    setError(response.data.message || 'Failed to load telemetry.');
                }
            } catch (err) {
                console.error("Weather Fetch Error:", err);
                setError('Atmospheric sensors currently offline.');
            } finally {
                // This is perfectly fine because it happens asynchronously AFTER the fetch
                setIsFetching(false); 
            }
        };

        fetchWeather();
        
        const REFRESH_INTERVAL = 5 * 60 * 1000; 
        const intervalId = setInterval(fetchWeather, REFRESH_INTERVAL);

        return () => clearInterval(intervalId);

    }, [sessionData]); 

    return (
        <WeatherContext.Provider value={{ weatherData, loading, error }}>
            {children}
        </WeatherContext.Provider>
    );
};