import { getWeatherData } from '../services/weatherService.js';

/**
 * @desc    Get current weather and track temp estimations for specific coordinates
 * @route   GET /api/weather/current
 * @access  Public
 */
export const getCurrentWeather = async (req, res) => {
    try {
        // Extract coordinates from query parameters (e.g., /api/weather/current?lat=43.73&lon=7.42)
        const { lat, lon } = req.query;

        // Validation
        if (!lat || !lon) {
            return res.status(400).json({
                success: false,
                message: 'Please provide both latitude (lat) and longitude (lon) query parameters.'
            });
        }

        // Parse to floats to ensure the service handles them correctly
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lon);

        if (isNaN(latitude) || isNaN(longitude)) {
            return res.status(400).json({
                success: false,
                message: 'Latitude and longitude must be valid numbers.'
            });
        }

        const weatherData = await getWeatherData(latitude, longitude);

        // Check if the service returned its fallback error object
        if (weatherData.error) {
            return res.status(503).json({
                success: false,
                message: weatherData.error,
                data: weatherData // Still return the N/A data so the frontend doesn't crash
            });
        }

        res.status(200).json({
            success: true,
            data: weatherData
        });

    } catch (error) {
        console.error('Weather Controller Error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching weather data.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};