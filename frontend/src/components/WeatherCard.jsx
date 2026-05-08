import 'react';

const WeatherCard = ({ weather, loading, error }) => {
    // UI States: Loading
    if (loading) {
        return (
            <div className="w-full flex flex-col items-center justify-center animate-pulse gap-4">
                <div className="grid grid-cols-2 gap-4 w-full">
                    <div className="h-24 bg-gray-800 rounded"></div>
                    <div className="h-24 bg-gray-800 rounded"></div>
                </div>
                <div className="h-20 w-full bg-gray-800 rounded"></div>
            </div>
        );
    }

    // UI States: Error
    if (error || weather?.error) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center text-center border border-red-900 bg-red-950/20 rounded-lg p-6">
                <span className="text-red-500 font-bold uppercase tracking-widest text-sm mb-2">
                    Telemetry Failure
                </span>
                <p className="text-gray-400 text-xs">
                    {error || weather?.error || "Unable to establish connection with atmospheric sensors."}
                </p>
            </div>
        );
    }

    if (!weather) return null;

    // F1 typically displays wind speed in km/h, OpenWeather metric defaults to m/s
    const windSpeedKmh = (weather.windSpeed * 3.6).toFixed(1);

    return (
        <div className="w-full flex flex-col gap-4">
            
            {/* Status Header */}
            <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-[10px] text-green-500 font-bold uppercase tracking-[0.2em]">
                        Live Feed
                    </span>
                </div>
                <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">
                    {weather.condition} - {weather.description}
                </span>
            </div>

            {/* Primary Metrics: Temperatures */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-950 border border-gray-800 rounded-lg p-4 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500"></div>
                    <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1 pl-2">
                        Air Temp
                    </span>
                    <div className="flex items-start pl-2">
                        <span className="text-4xl md:text-5xl font-black font-mono text-white">
                            {weather.airTemp}
                        </span>
                        <span className="text-lg text-cyan-500 font-bold mt-1 ml-1">°C</span>
                    </div>
                </div>

                <div className="bg-gray-950 border border-gray-800 rounded-lg p-4 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                    <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1 pl-2">
                        Track Temp (Est)
                    </span>
                    <div className="flex items-start pl-2">
                        <span className="text-4xl md:text-5xl font-black font-mono text-white">
                            {weather.trackTemp}
                        </span>
                        <span className="text-lg text-amber-500 font-bold mt-1 ml-1">°C</span>
                    </div>
                </div>
            </div>

            {/* Secondary Metrics: Humidity, Pressure, Wind */}
            <div className="grid grid-cols-3 gap-2 md:gap-4 mt-2">
                <TelemetryBlock 
                    label="Humidity" 
                    value={weather.humidity} 
                    unit="%" 
                />
                <TelemetryBlock 
                    label="Pressure" 
                    value={weather.pressure} 
                    unit="hPa" 
                />
                <TelemetryBlock 
                    label="Wind" 
                    value={windSpeedKmh} 
                    unit="km/h" 
                />
            </div>
        </div>
    );
};

/**
 * Sub-component for secondary telemetry blocks
 */
const TelemetryBlock = ({ label, value, unit }) => (
    <div className="flex flex-col items-center bg-gray-900 border border-gray-800 rounded p-2 md:p-3 shadow-inner">
        <span className="text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
            {label}
        </span>
        <div className="flex items-baseline gap-1">
            <span className="text-lg md:text-xl font-bold font-mono text-gray-200">
                {value}
            </span>
            <span className="text-[10px] text-gray-600 font-mono">
                {unit}
            </span>
        </div>
    </div>
);

export default WeatherCard;