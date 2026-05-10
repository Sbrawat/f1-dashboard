import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRace } from '../context/RaceContext';

// We will build this component next!
// import LiveTable from '../components/LiveTable'; 

const LiveSimView = () => {
    const { id: sessionKey } = useParams();
    const navigate = useNavigate();
    const { getRaceMetadata } = useRace();

    // Fetch the metadata instantly from our context cache
    const raceMeta = getRaceMetadata(sessionKey);

    const handleExitSim = () => {
        // Navigating away will eventually trigger our WebSocket cleanup!
        navigate('/timeline');
    };

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 p-4 font-sans flex flex-col">
            {/* Simulation Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b border-gray-800">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_8px_rgba(8,145,178,0.8)]"></div>
                        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white">
                            {raceMeta ? raceMeta.country_name : 'Loading Sim...'}
                        </h1>
                    </div>
                    <p className="text-gray-400 text-xs md:text-sm uppercase tracking-widest pl-5">
                        {raceMeta ? `${raceMeta.circuit_short_name} • Round ${raceMeta.round}` : `Session ID: ${sessionKey}`}
                    </p>
                </div>

                {/* Exit Button */}
                <button 
                    onClick={handleExitSim}
                    className="flex items-center gap-2 px-4 py-2 bg-red-950/30 text-red-500 border border-red-900/50 hover:bg-red-900/50 hover:text-red-400 rounded transition-colors text-xs font-bold uppercase tracking-widest"
                >
                    <span>⬅</span> Exit Simulation
                </button>
            </header>

            {/* Main Telemetry Area */}
            <main className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column: Timing Tower (Takes up 2/3 of space on large screens) */}
                <section className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden flex flex-col shadow-2xl">
                    <div className="px-4 py-3 bg-gray-950/50 border-b border-gray-800 flex justify-between items-center">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                            Live Timing Tower
                        </span>
                        <span className="text-[10px] text-cyan-600 font-mono">
                            SOCKET.IO STREAM
                        </span>
                    </div>
                    <div className="flex-grow p-0 overflow-x-auto">
                        {/* We will uncomment this once we build it! 
                            <LiveTable sessionKey={sessionKey} /> 
                        */}
                        <div className="h-96 flex flex-col items-center justify-center text-gray-600">
                            <span className="text-4xl mb-3 animate-bounce">⏱️</span>
                            <p className="uppercase tracking-widest text-sm">Awaiting Telemetry Stream Component</p>
                        </div>
                    </div>
                </section>

                {/* Right Column: Track Map / Extra Data (Optional Placeholder for later) */}
                <section className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-2xl flex flex-col">
                    <div className="px-4 py-3 bg-gray-950/50 border-b border-gray-800">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                            Sector Analysis
                        </span>
                    </div>
                    <div className="flex-grow p-4 flex items-center justify-center text-gray-700 text-xs uppercase tracking-widest text-center border-2 border-dashed border-gray-800 m-4 rounded">
                        Track Map / Speed Traps
                        <br/>(Coming Soon)
                    </div>
                </section>

            </main>
        </div>
    );
};

export default LiveSimView;