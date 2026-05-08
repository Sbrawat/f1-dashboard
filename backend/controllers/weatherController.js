import { getUpcomingSession } from '../services/f1ScheduleService.js';

/**
 * @desc    Get the exact next F1 session and circuit details
 * @route   GET /api/session/next
 * @access  Public
 */
export const getNextSession = async (req, res) => {
    try {
        const sessionData = await getUpcomingSession();

        // If the season is over, the service returns a message instead of a session name
        if (sessionData.message) {
            return res.status(200).json({
                success: true,
                data: sessionData
            });
        }

        res.status(200).json({
            success: true,
            data: sessionData
        });

    } catch (error) {
        console.error('Session Controller Error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve the upcoming session data.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};