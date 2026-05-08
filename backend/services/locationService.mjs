// backend/services/locationService.mjs

import { circuitCoordinates } from '../utils/circuitCoordinates.mjs';

/**
 * Extracts coordinates based on the circuit short name.
 * @param {string} circuitShortName - The name of the circuit from OpenF1
 * @returns {object} { lat, lon, fallback }
 */
export const getCircuitCoordinates = (circuitShortName) => {
    // 1. Sanitize the input to prevent basic string matching errors
    if (!circuitShortName) {
        throw new Error("Location Service Error: No circuit name provided.");
    }
    
    const normalizedName = circuitShortName.trim();

    // 2. Perform the fast memory lookup
    const coords = circuitCoordinates[normalizedName];

    // 3. Handle Cache Misses (Track not found)
    if (!coords) {
        console.warn(`[WARNING] Coordinates not found for circuit: "${normalizedName}". Defaulting to FIA Headquarters.`);
        
        // Return Place de la Concorde, Paris (FIA HQ) as a safe, non-crashing fallback
        return { 
            lat: 48.8650, 
            lon: 2.3214, 
            isFallback: true 
        };
    }

    // 4. Return the successful match
    return { 
        lat: coords.lat, 
        lon: coords.lon, 
        isFallback: false 
    };
};