import RaceCache from '../models/RaceCache.js';
import { getHistoricalCalendar, getRaceResults } from '../services/openF1Service.js';

/**
 * @desc    Get the race calendar for a specific season
 * @route   GET /api/races/calendar?year=YYYY
 * @access  Public
 */
export const getSeasonCalendar = async (req, res) => {
    try {
        // Default to the current year if the frontend doesn't specify one
        const year = req.query.year || new Date().getFullYear();
        
        const calendar = await getHistoricalCalendar(year);

        // Sort chronologically by start date to ensure the timeline flows correctly
        const sortedCalendar = calendar.sort((a, b) => new Date(a.date_start) - new Date(b.date_start));

        res.status(200).json({
            success: true,
            data: sortedCalendar
        });

    } catch (error) {
        console.error('Race Controller - Calendar Error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve the historical season calendar.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * @desc    Get the final classification/results for a specific race session
 * @route   GET /api/races/:id/results
 * @access  Public
 */

export const getRaceResultsById = async (req, res) => {
    try {
        const { id: sessionKey } = req.params;

        // 1. CHECK MONGODB FIRST
        const cachedRace = await RaceCache.findOne({ sessionKey: Number(sessionKey) });
        
        if (cachedRace) {
            console.log('Serving results from MongoDB Cache');
            return res.status(200).json({ success: true, data: cachedRace.results });
        }

        // 2. IF NOT IN DB, FETCH FROM EXTERNAL API
        console.log('Fetching results from OpenF1 API...');
        const rawPositions = await getRaceResults(sessionKey);

        // ... (Insert the data reduction logic we built earlier here) ...
        const finalClassification = Array.from(finalPositionsMap.values())
            .sort((a, b) => a.position - b.position);

        // 3. SAVE TO MONGODB FOR NEXT TIME
        await RaceCache.create({
            sessionKey: Number(sessionKey),
            results: finalClassification
        });

        // 4. SEND TO FRONTEND
        res.status(200).json({ success: true, data: finalClassification });

    } catch (error) {
        // ... error handling
    }
};