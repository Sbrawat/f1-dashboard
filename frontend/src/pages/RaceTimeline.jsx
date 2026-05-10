import  { useState, useMemo } from 'react';
// Assuming you create a useRace hook in the Context step
import { useRace } from '../context/RaceContext'; 
// The presentation component we will build next
import RaceGrid from '../components/RaceGrid'; 

const RaceTimeline = () => {
    // Extracting global state from our context
    const { calendar, loading, error } = useRace();
    
    // State for the active filter toggle
    const [filter, setFilter] = useState('all'); // 'all', 'completed', 'upcoming'

    // Memoize the filtered calendar so we don't recalculate on every render
    const filteredCalendar = useMemo(() => {
        if (!calendar) return [];
        
        const now = new Date();
        
        return calendar.filter(race => {
            const raceDate = new Date(race.date_start);
            if (filter === 'completed') return raceDate < now;
            if (filter === 'upcoming') return raceDate >= now;
            return true; // 'all'
        });
    }, [calendar, filter]);

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 p-4 md:p-8 font-sans">
            {/* Header Section */}
            <header className="mb-8 border-b border-gray-800 pb-6 max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-gray-900 border border-gray-700 rounded flex items-center justify-center">
                            <span className="text-gray-400 font-mono text-sm">🗓</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white">
                            Season Timeline
                        </h1>
                    </div>
                    <p className="text-gray-400 text-sm md:text-base uppercase tracking-widest">
                        Historical Telemetry & Race Archives
                    </p>
                </div>

                {/* Filtering Controls */}
                <div className="flex bg-gray-900 border border-gray-800 rounded-lg p-1">
                    <FilterButton 
                        active={filter === 'all'} 
                        onClick={() => setFilter('all')} 
                        label="Full Season" 
                    />
                    <FilterButton 
                        active={filter === 'completed'} 
                        onClick={() => setFilter('completed')} 
                        label="Archives" 
                    />
                    <FilterButton 
                        active={filter === 'upcoming'} 
                        onClick={() => setFilter('upcoming')} 
                        label="Upcoming" 
                    />
                </div>
            </header>

            {/* Main Content Area */}
            <main className="max-w-7xl mx-auto">
                {/* Error State */}
                {error && (
                    <div className="bg-red-950/20 border border-red-900 rounded-xl p-8 text-center">
                        <span className="text-red-500 font-bold uppercase tracking-widest block mb-2">
                            Archive Access Denied
                        </span>
                        <p className="text-gray-400 text-sm">{error}</p>
                    </div>
                )}

                {/* Loading State */}
                {loading && !error && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
                        {[1, 2, 3, 4, 5, 6].map((n) => (
                            <div key={n} className="h-48 bg-gray-900 rounded-xl border border-gray-800"></div>
                        ))}
                    </div>
                )}

                {/* Data State */}
                {!loading && !error && (
                    <RaceGrid races={filteredCalendar} activeFilter={filter} />
                )}
            </main>
        </div>
    );
};

/**
 * Sub-component for the filter toggles to keep the main component clean
 */
const FilterButton = ({ active, onClick, label }) => {
    return (
        <button
            onClick={onClick}
            className={`
                px-4 py-2 text-xs md:text-sm font-bold uppercase tracking-widest rounded-md transition-all duration-200
                ${active 
                    ? 'bg-gray-800 text-white shadow-inner border border-gray-700' 
                    : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'
                }
            `}
        >
            {label}
        </button>
    );
};

export default RaceTimeline;