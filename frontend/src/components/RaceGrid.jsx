import 'react';
import { useNavigate } from 'react-router-dom';

const RaceGrid = ({ races, activeFilter }) => {
    const navigate = useNavigate();

    
    // Handle Empty States based on the active filter
    if (!races || races.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-4 border border-dashed border-gray-800 rounded-xl bg-gray-900/50">
                <span className="text-4xl mb-4">🏁</span>
                <h3 className="text-xl font-bold text-gray-300 uppercase tracking-widest mb-2">
                    No Sessions Found
                </h3>
                <p className="text-gray-500 text-sm text-center">
                    {activeFilter === 'upcoming' 
                        ? "The current season has concluded. No upcoming races available." 
                        : "No historical telemetry archives are available for this selection."}
                </p>
            </div>
        );
    }
    

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {races.map((race) => (
                <RaceCard 
                    key={race.session_key || race.date_start} 
                    race={race} 
                    navigate={navigate} 
                />
            ))}
        </div>
    );
};

/**
 * Individual Card Component for the Grid
 */
const RaceCard = ({ race, navigate }) => {
    // Determine if the race is in the past to enable the Live-Sim button
    const isCompleted = new Date(race.date_start) < new Date();

    // Format the date for the UI
    const formattedDate = new Date(race.date_start).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });

    const handleLaunchSim = () => {

        if (isCompleted && race.session_key) {
            navigate(`/sim/${race.session_key}`);
        }
    };

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden flex flex-col transition-all duration-300 hover:border-gray-600 hover:shadow-2xl hover:shadow-cyan-900/10 group">
            
            {/* Card Header */}
            <div className="px-5 py-3 border-b border-gray-800 bg-gray-950/50 flex justify-between items-center">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    Round {race.round || 'TBA'}
                </span>
                <span className={`text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-1 rounded ${
                    isCompleted 
                        ? 'bg-cyan-950/50 text-cyan-500 border border-cyan-900/50' 
                        : 'bg-amber-950/50 text-amber-500 border border-amber-900/50'
                }`}>
                    {isCompleted ? 'Archived' : 'Scheduled'}
                </span>
            </div>

            {/* Card Body */}
            <div className="p-5 flex-grow flex flex-col">
                <h3 className="text-xl font-black text-white uppercase tracking-wide mb-1 group-hover:text-cyan-400 transition-colors">
                    {race.country_name || race.location || 'Grand Prix'}
                </h3>
                <p className="text-xs text-gray-400 uppercase tracking-widest mb-4">
                    {race.circuit_short_name || 'Circuit Info Unavailable'}
                </p>

                <div className="mt-auto flex items-center justify-between border-t border-gray-800 pt-4">
                    <div className="flex items-center gap-2 text-gray-300">
                        <span className="text-sm">📅</span>
                        <span className="font-mono text-sm tracking-wider">
                            {formattedDate}
                        </span>
                    </div>
                </div>
            </div>

            {/* Action Area */}
            <div className="p-4 pt-0">
                <button
                    onClick={() => handleLaunchSim(race.session_key)}
                    disabled={!isCompleted}
                    className={`w-full py-3 rounded text-xs font-bold uppercase tracking-[0.15em] transition-all ${
                        isCompleted
                            ? 'bg-cyan-900 hover:bg-cyan-800 text-cyan-100 shadow-[0_0_15px_rgba(8,145,178,0.2)] hover:shadow-[0_0_20px_rgba(8,145,178,0.4)]'
                            : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                    }`}
                >
                    {isCompleted ? 'Launch Live-Sim' : 'Telemetry Pending'}
                </button>
            </div>
        </div>
    );
};

export default RaceGrid;