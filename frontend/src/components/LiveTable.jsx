import React, { useEffect, useMemo } from 'react';
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

    useEffect(() => {
        if (sessionKey) startSimulation(sessionKey);
        return () => stopSimulation();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sessionKey]);

    const tableData = useMemo(() => {
        if (!currentFrame || !currentFrame.positions) return [];

        const { positions, intervals, timestamp } = currentFrame;
        const timeTick = timestamp ? new Date(timestamp).getTime() : 0;

        const merged = positions.map(pos => {
            const driverInterval = intervals?.find(i => i.driver_number === pos.driver_number);
            
            // Deterministic Speed
            const simulatedSpeed = 280 + ((pos.driver_number * 17 + timeTick) % 41);

            // Deterministic Sector Times (Simulating changes every frame)
            // In a production app, this would come from an OpenF1 /laps websocket stream
            const baseS1 = 28.5;
            const baseS2 = 39.2;
            const baseS3 = 23.1;
            
            // Generate a fluctuating state (0, 1, or 2) to simulate sector statuses
            // 0 = Yellow (No improvement), 1 = Green (Personal Best), 2 = Purple (Fastest Overall)
            const s1Status = (pos.driver_number + timeTick) % 15 === 0 ? 2 : (pos.driver_number + timeTick) % 7 === 0 ? 1 : 0;
            const s2Status = (pos.driver_number + timeTick + 1) % 18 === 0 ? 2 : (pos.driver_number + timeTick + 1) % 6 === 0 ? 1 : 0;
            const s3Status = (pos.driver_number + timeTick + 2) % 20 === 0 ? 2 : (pos.driver_number + timeTick + 2) % 5 === 0 ? 1 : 0;

            return {
                driver_number: pos.driver_number,
                position: pos.position,
                gapToLeader: driverInterval ? driverInterval.gap_to_leader : null, 
                speed: pos.speed || simulatedSpeed,
                sectors: [
                    { time: (baseS1 + ((pos.driver_number % 5) * 0.1)).toFixed(3), status: s1Status },
                    { time: (baseS2 + ((pos.driver_number % 4) * 0.1)).toFixed(3), status: s2Status },
                    { time: (baseS3 + ((pos.driver_number % 3) * 0.1)).toFixed(3), status: s3Status },
                ]
            };
        });

        return merged.sort((a, b) => a.position - b.position);
    }, [currentFrame]);

    // UI States (Loading & Error)
    if (error) return <div className="p-8 text-center text-red-500 font-bold uppercase">{error}</div>;
    
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
        <div className="w-full min-w-[700px]">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-gray-950 border-b border-gray-800 text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest sticky top-0 z-10">
                <div className="col-span-1 text-center">Pos</div>
                <div className="col-span-2">Driver</div>
                <div className="col-span-2 text-right">Interval</div>
                <div className="col-span-2 text-center">Sector 1</div>
                <div className="col-span-2 text-center">Sector 2</div>
                <div className="col-span-2 text-center">Sector 3</div>
                <div className="col-span-1 text-right">Spd</div>
            </div>

            {/* Table Body */}
            <div className="flex flex-col pb-2">
                {tableData.map((row) => (
                    <div 
                        key={row.driver_number}
                        className="grid grid-cols-12 gap-2 px-4 py-1.5 border-b border-gray-800/40 hover:bg-gray-800/80 transition-colors items-center group"
                    >
                        {/* Position */}
                        <div className="col-span-1 flex justify-center">
                            <span className="w-5 h-5 rounded bg-gray-900 border border-gray-700 text-gray-300 font-mono text-[10px] flex items-center justify-center font-bold">
                                {row.position}
                            </span>
                        </div>

                        {/* Driver Number & Color Bar */}
                        <div className="col-span-2 flex items-center gap-2">
                            <div className="w-1 h-3.5 bg-cyan-500 rounded-full group-hover:bg-cyan-400 transition-colors"></div>
                            <span className="font-black text-gray-100 uppercase text-xs md:text-sm tracking-wider">
                                {row.driver_number}
                            </span>
                        </div>

                        {/* Interval */}
                        <div className="col-span-2 text-right">
                            <span className="font-mono text-xs text-amber-400 font-bold">
                                {row.gapToLeader === 0 || !row.gapToLeader ? 'Leader' : `+${row.gapToLeader.toFixed(3)}`}
                            </span>
                        </div>

                        {/* Sectors 1, 2, 3 */}
                        {row.sectors.map((sector, index) => (
                            <div key={index} className="col-span-2 text-center flex justify-center">
                                <SectorBox time={sector.time} status={sector.status} />
                            </div>
                        ))}

                        {/* Speed Trap */}
                        <div className="col-span-1 text-right">
                            <span className="font-mono text-[10px] md:text-xs text-gray-400 group-hover:text-cyan-300 transition-colors">
                                {row.speed}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

/**
 * Micro-component for Sector Times to handle the F1 color logic
 * Status: 0 = Yellow, 1 = Green, 2 = Purple
 */
const SectorBox = ({ time, status }) => {
    let colorClasses = "text-yellow-500"; // Default: No improvement
    let bgClasses = "transparent";

    if (status === 1) {
        // Personal Best
        colorClasses = "text-green-400 font-bold";
        bgClasses = "bg-green-900/20";
    } else if (status === 2) {
        // Overall Fastest (Flashing Purple)
        colorClasses = "text-fuchsia-400 font-black animate-pulse";
        bgClasses = "bg-fuchsia-900/30 border border-fuchsia-800/50 shadow-[0_0_8px_rgba(232,121,249,0.3)]";
    }

    return (
        <div className={`px-2 py-0.5 rounded transition-all duration-300 ${bgClasses}`}>
            <span className={`font-mono text-[10px] md:text-xs ${colorClasses}`}>
                {time}
            </span>
        </div>
    );
};

export default LiveTable;