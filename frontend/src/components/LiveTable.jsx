import { useEffect, useMemo } from 'react';
import { useTelemetry } from '../context/TelemetryContext';

const LiveTable = ({ sessionKey }) => {
    const { 
        simStatus, 
        simMessage, 
        currentFrame, 
        error, 
        startSimulation, 
        stopSimulation 
    } = useTelemetry();

    // Start simulation on mount, cleanup on unmount
    useEffect(() => {
        if (sessionKey) {
            startSimulation(sessionKey);
        }
        
        // This prevents memory leaks if the user clicks "Back" mid-race!
        return () => stopSimulation();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sessionKey]);

// Merge positions and intervals into a single sorted array
    const tableData = useMemo(() => {
        if (!currentFrame || !currentFrame.positions) return [];

        const { positions, intervals, timestamp } = currentFrame;
        
        // Convert the ISO timestamp to a raw number (milliseconds) so we can do math with it
        const timeTick = timestamp ? new Date(timestamp).getTime() : 0;

        // Map driver data
        const merged = positions.map(pos => {
            const driverInterval = intervals?.find(i => i.driver_number === pos.driver_number);
            
            // Deterministic pseudo-random speed generator
            // Uses driver_number to ensure different cars have different speeds,
            // and timeTick to ensure the speed changes slightly from frame to frame.
            // Modulo 41 keeps the variance between 0 and 40.
            const simulatedSpeed = 280 + ((pos.driver_number * 17 + timeTick) % 41);

            return {
                driver_number: pos.driver_number,
                position: pos.position,
                // OpenF1 intervals provides gap to leader
                gapToLeader: driverInterval ? driverInterval.gap_to_leader : null, 
                // Fallback to our pure simulated speed if real speed is missing
                speed: pos.speed || simulatedSpeed
            };
        });

        // Sort strictly by position (1st to last)
        return merged.sort((a, b) => a.position - b.position);
    }, [currentFrame]);

    // UI States
    if (error) {
        return <div className="p-8 text-center text-red-500 font-bold uppercase">{error}</div>;
    }

    if (simStatus !== 'live' && simStatus !== 'completed') {
        return (
            <div className="flex flex-col items-center justify-center h-96 text-cyan-500">
                <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="uppercase tracking-widest font-bold text-sm animate-pulse">
                    {simMessage || 'Connecting to Telemetry...'}
                </p>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-gray-950 border-b border-gray-800 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                <div className="col-span-2 text-center">Pos</div>
                <div className="col-span-4">Driver No.</div>
                <div className="col-span-3 text-right">Interval</div>
                <div className="col-span-3 text-right">Speed</div>
            </div>

            {/* Table Body */}
            <div className="flex flex-col">
                {tableData.map((row) => (
                    <div 
                        key={row.driver_number}
                        className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-gray-800/50 hover:bg-gray-800 transition-colors items-center group"
                    >
                        {/* Position */}
                        <div className="col-span-2 flex justify-center">
                            <span className="w-6 h-6 rounded bg-gray-800 text-white font-mono text-xs flex items-center justify-center font-bold">
                                {row.position}
                            </span>
                        </div>

                        {/* Driver Number */}
                        <div className="col-span-4 flex items-center gap-2">
                            <div className="w-1 h-4 bg-cyan-500 rounded-full"></div>
                            <span className="font-black text-gray-200 uppercase tracking-wider">
                                {row.driver_number}
                            </span>
                        </div>

                        {/* Interval to Leader */}
                        <div className="col-span-3 text-right">
                            <span className="font-mono text-xs text-amber-400 font-bold">
                                {row.gapToLeader === 0 || !row.gapToLeader ? 'Leader' : `+${row.gapToLeader.toFixed(3)}`}
                            </span>
                        </div>

                        {/* Speed Trap Data (with CSS micro-animation) */}
                        <div className="col-span-3 text-right">
                            <span className="font-mono text-xs text-gray-300 group-hover:text-cyan-300 transition-colors">
                                {row.speed} <span className="text-[9px] text-gray-500">km/h</span>
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LiveTable;