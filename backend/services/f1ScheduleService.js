import axios from 'axios';

// Assuming you are using a standard API like OpenF1 or a Jolpi/Ergast mirror.
// Replace with your specific API base URL via environment variables.
const API_BASE_URL = process.env.F1_API_BASE_URL || 'https://api.jolpi.ca/ergast/f1'; 

/**
 * Fetches the F1 schedule and calculates the exact timestamp and coordinates 
 * for the immediately upcoming session.
 * 
 * @returns {Promise<Object>} An object containing the session name, exact timestamp, and circuit coordinates.
 */
export const getUpcomingSession = async () => {
    try {
        // Fetch the current season's schedule
        // Note: You can optimize this by passing current date parameters if your API supports it.
        const response = await axios.get(`${API_BASE_URL}/current.json`);
        const races = response.data.MRData.RaceTable.Races;

        if (!races || races.length === 0) {
            throw new Error('No race data available for the current season.');
        }

        const now = new Date();
        let upcomingRace = null;
        let upcomingSessionName = null;
        let sessionStartTime = null;

        // Iterate through the calendar to find the first session that is in the future
        for (const race of races) {
            // Check main race time
            const raceDate = new Date(`${race.date}T${race.time}`);
            
            // If the race itself hasn't happened yet, we look at its specific sessions (FP1, Quali, etc.)
            if (raceDate > now) {
                upcomingRace = race;
                
                // Determine the exact next session within this race weekend.
                // Assuming the API returns nested session times (e.g., FirstPractice, Qualifying)
                const sessions = [
                    { name: 'FP1', date: new Date(`${race.FirstPractice?.date}T${race.FirstPractice?.time}`) },
                    { name: 'FP2', date: new Date(`${race.SecondPractice?.date}T${race.SecondPractice?.time}`) },
                    { name: 'FP3', date: new Date(`${race.ThirdPractice?.date}T${race.ThirdPractice?.time}`) },
                    { name: 'Sprint', date: new Date(`${race.Sprint?.date}T${race.Sprint?.time}`) },
                    { name: 'Qualifying', date: new Date(`${race.Qualifying?.date}T${race.Qualifying?.time}`) },
                    { name: 'Race', date: raceDate }
                ];

                // Sort sessions chronologically and find the first one in the future
                const futureSessions = sessions
                    .filter(session => !isNaN(session.date) && session.date > now)
                    .sort((a, b) => a.date - b.date);

                if (futureSessions.length > 0) {
                    upcomingSessionName = `${race.raceName} - ${futureSessions[0].name}`;
                    sessionStartTime = futureSessions[0].date;
                    break; 
                }
            }
        }

        if (!upcomingRace) {
            return { message: 'The current F1 season has concluded.' };
        }

        // Extract Latitude and Longitude for the Weather Service
        const { lat, long } = upcomingRace.Circuit.Location;

        return {
            sessionName: upcomingSessionName,
            round: upcomingRace.round,
            circuitName: upcomingRace.Circuit.circuitName,
            timestamp: sessionStartTime.toISOString(), // ISO format for easy frontend parsing
            coordinates: {
                latitude: parseFloat(lat),
                longitude: parseFloat(long)
            }
        };

    } catch (error) {
        console.error('Error fetching F1 schedule:', error.message);
        throw new Error('Failed to fetch upcoming session data. Please ensure the F1 API is reachable.');
    }
};