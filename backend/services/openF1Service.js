import axios from 'axios';

// OpenF1 does not require an API key, but we use an env variable for flexibility 
// (e.g., if you set up a local mirror or proxy later to avoid rate limits)
const OPENF1_BASE_URL = process.env.OPENF1_API_BASE_URL || 'https://api.openf1.org/v1';

/**
 * Fetches the historical race calendar for a given year.
 * @param {number|string} year - The F1 season year (e.g., 2023)
 * @returns {Promise<Array>} List of race sessions
 */
export const getHistoricalCalendar = async (year) => {
    try {
        const response = await axios.get(`${OPENF1_BASE_URL}/sessions`, {
            params: { 
                year: year,
                session_name: 'Race' // Filter strictly for main races, not practice/quali
            }
        });
        return response.data;
    } catch (error) {
        console.error(`OpenF1 Service - Calendar Error (${year}):`, error.message);
        throw new Error('Failed to fetch historical calendar.');
    }
};

/**
 * Fetches the classification/results for a specific session.
 * Note: OpenF1 tracks live positions. To get "results", we fetch the final recorded positions.
 * @param {number} sessionKey - The unique OpenF1 session identifier
 * @returns {Promise<Array>} Final track positions and driver data
 */
export const getRaceResults = async (sessionKey) => {
    try {
        const response = await axios.get(`${OPENF1_BASE_URL}/position`, {
            params: { session_key: sessionKey }
        });
        
        // Data optimization: OpenF1 returns EVERY position change over the whole race.
        // For a simple "results" view, you usually want the latest/final position entry per driver.
        // We will let the controller or live-sim engine handle that reduction, returning raw here.
        return response.data;
    } catch (error) {
        console.error(`OpenF1 Service - Results Error (${sessionKey}):`, error.message);
        throw new Error('Failed to fetch race results.');
    }
};

/**
 * Fetches live interval and gap data between cars.
 * @param {number} sessionKey - The unique OpenF1 session identifier
 * @returns {Promise<Array>} Interval data (gap to leader, gap to car ahead)
 */
export const getIntervals = async (sessionKey) => {
    try {
        const response = await axios.get(`${OPENF1_BASE_URL}/intervals`, {
            params: { session_key: sessionKey }
        });
        return response.data;
    } catch (error) {
        console.error(`OpenF1 Service - Intervals Error (${sessionKey}):`, error.message);
        throw new Error('Failed to fetch interval telemetry.');
    }
};

/**
 * Fetches raw car speed and throttle/brake telemetry.
 * @param {number} sessionKey - The unique OpenF1 session identifier
 * @param {number} [driverNumber] - Optional: Filter by specific driver (e.g., 1 for Max Verstappen)
 * @returns {Promise<Array>} Speed trap and RPM data
 */
export const getCarSpeeds = async (sessionKey, driverNumber = null) => {
    try {
        const params = { session_key: sessionKey };
        if (driverNumber) {
            params.driver_number = driverNumber;
        }

        // /car_data provides speed, rpm, nGear, throttle, and brake
        const response = await axios.get(`${OPENF1_BASE_URL}/car_data`, { params });
        return response.data;
    } catch (error) {
        console.error(`OpenF1 Service - Car Speeds Error (${sessionKey}):`, error.message);
        throw new Error('Failed to fetch car speed telemetry.');
    }
};

/**
 * Fetches the exact X, Y, Z coordinates of cars on the track.
 * Essential for rendering a live mini-map of the circuit.
 * @param {number} sessionKey - The unique OpenF1 session identifier
 * @param {number} [driverNumber] - Optional: Filter by specific driver
 * @returns {Promise<Array>} Spatial location data
 */
export const getTrackPositions = async (sessionKey, driverNumber = null) => {
    try {
        const params = { session_key: sessionKey };
        if (driverNumber) {
            params.driver_number = driverNumber;
        }

        // /location provides x, y, z coordinates
        const response = await axios.get(`${OPENF1_BASE_URL}/location`, { params });
        return response.data;
    } catch (error) {
        console.error(`OpenF1 Service - Track Positions Error (${sessionKey}):`, error.message);
        throw new Error('Failed to fetch spatial track positions.');
    }
};