import 'react';

// Importing components (We will build these next in Task 2.2)
import NextSessionCard from '../components/NextSessionCard';
import WeatherCard from '../components/WeatherCard';

// Importing context hooks (We will build these in the Context step)
// Assuming you create custom hooks for cleaner imports, e.g., useSession() and useWeather()
import { useSession } from '../context/SessionContext';
import { useWeather } from '../context/WeatherContext';

const RaceControl = () => {
    // Extracting global state from our contexts
    const { 
        sessionData, 
        loading: sessionLoading, 
        error: sessionError 
    } = useSession();
    
    const { 
        weatherData, 
        loading: weatherLoading, 
        error: weatherError 
    } = useWeather();

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 p-4 md:p-8 font-sans">
            {/* Header Section */}
            <header className="mb-8 border-b border-red-600 pb-4 max-w-7xl mx-auto">
                <div className="flex items-center gap-3">
                    {/* Optional: A pulsing live indicator */}
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                    <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white">
                        Race Control
                    </h1>
                </div>
                <p className="text-gray-400 text-sm md:text-base mt-2 uppercase tracking-widest">
                    Live Telemetry & Atmospheric Data
                </p>
            </header>

            {/* Hero Module: Grid Layout */}
            <main className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
                
                {/* Left Column: Next Session & Countdown */}
                <section className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 flex flex-col h-full overflow-hidden">
                    <div className="bg-gray-800 px-6 py-3 border-b border-gray-700">
                        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                            Session Status
                        </h2>
                    </div>
                    <div className="p-6 flex-grow flex items-center justify-center">
                        <NextSessionCard 
                            session={sessionData} 
                            loading={sessionLoading} 
                            error={sessionError} 
                        />
                    </div>
                </section>

                {/* Right Column: Localized Weather */}
                <section className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 flex flex-col h-full overflow-hidden">
                    <div className="bg-gray-800 px-6 py-3 border-b border-gray-700">
                        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                            Track Atmospheric Data
                        </h2>
                    </div>
                    <div className="p-6 flex-grow flex items-center justify-center">
                        <WeatherCard 
                            weather={weatherData} 
                            loading={weatherLoading} 
                            error={weatherError} 
                        />
                    </div>
                </section>

            </main>
        </div>
    );
};

export default RaceControl;