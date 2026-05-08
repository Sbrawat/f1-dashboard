import axios from 'axios';
import { cacheProvider } from './cacheService.js';

const WEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

/**
 * Fetches weather and estimates track conditions.
 * @param {number} lat 
 * @param {number} lon 
 */
export const getWeatherData = async (lat, lon) => {
    const cacheKey = `weather_${lat}_${lon}`;

    // 1. Check Cache
    const cachedData = cacheProvider.get(cacheKey);
    if (cachedData) return cachedData;

    try {
        const response = await axios.get(BASE_URL, {
            params: {
                lat,
                lon,
                appid: process.env.OPENWEATHER_API_KEY,
                units: 'metric' // F1 uses Celsius 
            }
        });

        const { main, weather, clouds } = response.data;
        const airTemp = main.temp;

        // 2. Track Temp Estimation Logic
        // In F1, track temp is usually significantly higher than air temp in the sun.
        // Heuristic: Air Temp + (Base margin based on cloud cover)
        // Clear sky = +15°C, Broken clouds = +8°C, Overcast = +2°C
        const cloudCover = clouds.all; // 0 to 100
        const trackMargin = Math.max(2, 15 * (1 - cloudCover / 100));
        const estimatedTrackTemp = airTemp + trackMargin;

        const weatherPayload = {
            airTemp: airTemp.toFixed(1),
            trackTemp: estimatedTrackTemp.toFixed(1),
            humidity: main.humidity,
            condition: weather[0].main, // e.g., 'Rain', 'Clear'
            description: weather[0].description,
            pressure: main.pressure,
            windSpeed: response.data.wind.speed,
            lastUpdated: new Date().toISOString()
        };

        // 3. Store in Cache (10-minute TTL)
        cacheProvider.set(cacheKey, weatherPayload);

        return weatherPayload;
    } catch (error) {
        console.error('Weather Service Error:', error.message);
        // If weather fails, we don't want the whole dashboard to crash
        return { 
            error: "Weather data currently unavailable",
            airTemp: "N/A", 
            trackTemp: "N/A" 
        };
    }
};