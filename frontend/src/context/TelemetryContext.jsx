/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useRef, useCallback } from 'react';
import axios from 'axios';

export const TelemetryContext = createContext();

// Utility to pause and respect the 3 req/sec limit during boot
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const TelemetryProvider = ({ children }) => {
    // UI States
    const [simStatus, setSimStatus] = useState('idle'); 
    const [simMessage, setSimMessage] = useState('');
    const [currentFrame, setCurrentFrame] = useState(null);
    const [error, setError] = useState(null);
    const [driversMap, setDriversMap] = useState({}); // Passed to children for driver names
    
    // Engine Refs
    const playbackTimeoutRef = useRef(null);
    const currentSimTimeRef = useRef(null);
    
    // 🛡️ Strict Mode & Zombie Loop Protections
    const isBootingRef = useRef(false);
    const isActiveRef = useRef(false);

    // Engine Memory
    const latestStateRef = useRef({
        positions: {},
        intervals: {}
    });

    const startSimulation = useCallback(async (sessionKey) => {
        if (isBootingRef.current) return;
        isBootingRef.current = true;
        isActiveRef.current = true;

        if (playbackTimeoutRef.current) clearTimeout(playbackTimeoutRef.current);
        
        setSimStatus('loading');
        setError(null);
        setSimMessage('Initializing Frontend Engine...');

        try {
            // 1. Fetch Start Time
            setSimMessage('Fetching Session Metadata...');
            const sessionRes = await axios.get(`https://api.openf1.org/v1/sessions?session_key=${sessionKey}`);
            if (!sessionRes.data || sessionRes.data.length === 0) throw new Error("Session not found");
            
            currentSimTimeRef.current = new Date(sessionRes.data[0].date_start).getTime();

            if (!isActiveRef.current) return;
            await sleep(400); // Breathe

            // 2. Fetch Driver Roster
            setSimMessage('Fetching Driver Roster...');
            const driversRes = await axios.get(`https://api.openf1.org/v1/drivers?session_key=${sessionKey}`);
            
            const newDriversMap = {};
            driversRes.data.forEach(driver => {
                newDriversMap[driver.driver_number] = {
                    acronym: driver.name_acronym,
                    name: driver.full_name
                };
                // Initialize memory
                latestStateRef.current.positions[driver.driver_number] = { driver_number: driver.driver_number, position: 0, speed: 0 };
                latestStateRef.current.intervals[driver.driver_number] = { driver_number: driver.driver_number, gap_to_leader: 0 };
            });
            setDriversMap(newDriversMap); // Push to React State for children

            setSimStatus('live');
            setSimMessage('Live Simulation Running');

            if (!isActiveRef.current) return;
            await sleep(400); // Breathe

            // ==========================================
            // 🏎️ THE 4-SECOND METRONOME
            // ==========================================
            const fetchNextFrame = async () => {
                if (!isActiveRef.current) return;

                // Create a 4-second window
                const windowStart = new Date(currentSimTimeRef.current).toISOString();
                const windowEnd = new Date(currentSimTimeRef.current + 4000).toISOString();
                
                // Advance the internal clock by 4 seconds
                currentSimTimeRef.current += 4000;

                try {
                    // Fetch Intervals ONLY
                    const intRes = await axios.get(`https://api.openf1.org/v1/intervals?session_key=${sessionKey}&date>${windowStart}&date<${windowEnd}`);

                    if (intRes.data && intRes.data.length > 0) {
                        
                        // Update interval memory
                        intRes.data.forEach(i => {
                            latestStateRef.current.intervals[i.driver_number] = {
                                driver_number: i.driver_number,
                                // Safely handle null gaps (usually the leader)
                                gap_to_leader: i.gap_to_leader ?? 0 
                            };
                        });

                        // Derive Positions by sorting the gaps
                        const sortedByGap = Object.values(latestStateRef.current.intervals)
                            .sort((a, b) => a.gap_to_leader - b.gap_to_leader);

                        sortedByGap.forEach((driver, index) => {
                            latestStateRef.current.positions[driver.driver_number] = {
                                driver_number: driver.driver_number,
                                position: index + 1, // 1st, 2nd, 3rd
                                speed: 0 // Handled by LiveTable simulator
                            };
                        });

                        // Push to React UI
                        if (isActiveRef.current) {
                            setCurrentFrame({
                                timestamp: windowStart,
                                positions: Object.values(latestStateRef.current.positions),
                                intervals: Object.values(latestStateRef.current.intervals)
                            });
                        }
                    }

                } catch (err) {
                    if (err.response && err.response.status === 404) {
                        console.log(`No cars at ${windowStart}... fast-forwarding 1 minute.`);
                        // Fast-forward 1 minute (we already added 4s, so add 56s more)
                        currentSimTimeRef.current += 56000; 
                    } else {
                        console.error("Tick Error:", err.message);
                    }
                }

                // Schedule the next frame EXACTLY 4000ms after this one finishes
                if (isActiveRef.current) {
                    playbackTimeoutRef.current = setTimeout(fetchNextFrame, 4000);
                }
            };

            // Start the engine
            fetchNextFrame();
            isBootingRef.current = false;

        } catch (err) {
            console.error('Failed to start simulation:', err);
            setError(err.message || 'Failed to connect to OpenF1');
            setSimStatus('error');
            isBootingRef.current = false; 
        }
    }, []);

    const stopSimulation = useCallback(() => {
        isActiveRef.current = false; 
        if (playbackTimeoutRef.current) {
            clearTimeout(playbackTimeoutRef.current);
            playbackTimeoutRef.current = null;
        }
        setSimStatus('idle');
        setCurrentFrame(null);
        setError(null);
        isBootingRef.current = false;
        
        latestStateRef.current = { positions: {}, intervals: {} };
    }, []);

    return (
        <TelemetryContext.Provider value={{
            simStatus,
            simMessage,
            currentFrame,
            error,
            startSimulation,
            stopSimulation,
            driversMap // EXPORTED TO CHILDREN HERE
        }}>
            {children}
        </TelemetryContext.Provider>
    );
};

// DO NOT DELETE THIS EXPORT. IT IS USED BY YOUR LIVETABLE.JSX
export const useTelemetry = () => useContext(TelemetryContext);