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

        if (!sessionKey) {
            return res.status(400).json({
                success: false,
                message: 'A valid session ID is required.'
            });
        }

        const rawPositions = await getRaceResults(sessionKey);

        if (!rawPositions || rawPositions.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No results found for this session.'
            });
        }

        // Data Reduction: OpenF1 returns position changes for every lap.
        // We only want the FINAL classification for the results view.
        const finalPositionsMap = new Map();

        rawPositions.forEach(entry => {
            const existingEntry = finalPositionsMap.get(entry.driver_number);
            
            // If the driver isn't in the map yet, or if this current entry has a later timestamp, update it.
            if (!existingEntry || new Date(entry.date) > new Date(existingEntry.date)) {
                finalPositionsMap.set(entry.driver_number, entry);
            }
        });

        // Convert the map back to an array and sort by finishing position (1st to 20th)
        const finalClassification = Array.from(finalPositionsMap.values())
            .sort((a, b) => a.position - b.position);

        res.status(200).json({
            success: true,
            data: finalClassification
        });

    } catch (error) {
        console.error('Race Controller - Results Error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve race results.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};