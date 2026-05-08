import  { useState, useEffect, useMemo } from 'react';

const NextSessionCard = ({ session, loading, error }) => {
    // 1. Only track the current time in state
    const [now, setNow] = useState(() => new Date().getTime());

    // Memoize the target date to avoid recalculating on every tick
    const targetDate = useMemo(() => {
        return session?.timestamp ? new Date(session.timestamp).getTime() : null;
    }, [session]);

    // 2. The effect now ONLY handles the async subscription (the interval)
    useEffect(() => {
        if (!targetDate) return;

        const timerInterval = setInterval(() => {
            const currentTime = new Date().getTime();
            setNow(currentTime);
            
            // If the session went live, kill the interval
            if (targetDate - currentTime <= 0) {
                clearInterval(timerInterval);
            }
        }, 1000);

        return () => clearInterval(timerInterval); // Cleanup on unmount
    }, [targetDate]);

    // 3. Derive the exact time left during the render cycle!
    let isLive = false;
    let timeLeft = { days: '00', hours: '00', minutes: '00', seconds: '00' };

    if (targetDate) {
        const difference = targetDate - now;

        if (difference <= 0) {
            isLive = true;
        } else {
            // Calculate exact time and pad with leading zeros
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)).toString().padStart(2, '0'),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24).toString().padStart(2, '0'),
                minutes: Math.floor((difference / 1000 / 60) % 60).toString().padStart(2, '0'),
                seconds: Math.floor((difference / 1000) % 60).toString().padStart(2, '0')
            };
        }
    }

    // UI States: Loading and Error
    if (loading) {
        return (
            <div className="w-full flex flex-col items-center justify-center animate-pulse">
                <div className="h-6 w-48 bg-gray-700 rounded mb-4"></div>
                <div className="h-16 w-full max-w-sm bg-gray-800 rounded"></div>
            </div>
        );
    }

    if (error || session?.message) {
        return (
            <div className="text-center">
                <p className="text-red-500 font-medium">
                    {error || session?.message || "Data unavailable."}
                </p>
            </div>
        );
    }

    if (!session) return null;

    return (
        <div className="w-full flex flex-col items-center justify-center text-center">
            {/* Session Info */}
            <div className="mb-6">
                <h3 className="text-xl md:text-2xl font-bold text-white uppercase tracking-wide">
                    {session.sessionName}
                </h3>
                <p className="text-gray-400 mt-1 uppercase text-sm tracking-widest">
                    Round {session.round} • {session.circuitName}
                </p>
            </div>

            {/* Countdown / Live Display */}
            {isLive ? (
                <div className="bg-red-600/20 border border-red-500 px-8 py-4 rounded-xl animate-pulse">
                    <span className="text-red-500 font-black text-3xl uppercase tracking-[0.2em]">
                        Session is Live
                    </span>
                </div>
            ) : (
                <div className="grid grid-cols-4 gap-2 md:gap-4 text-center">
                    <TimeUnit value={timeLeft.days} label="Days" />
                    <TimeUnit value={timeLeft.hours} label="Hours" />
                    <TimeUnit value={timeLeft.minutes} label="Mins" />
                    <TimeUnit value={timeLeft.seconds} label="Secs" />
                </div>
            )}
        </div>
    );
};

/**
 * Sub-component for individual time units to keep the main component clean
 */
const TimeUnit = ({ value, label }) => (
    <div className="flex flex-col items-center bg-gray-950 border border-gray-800 rounded-lg p-3 md:p-4 min-w-[70px] md:min-w-[90px] shadow-inner">
        <span className="text-3xl md:text-5xl font-black font-mono text-white mb-1">
            {value}
        </span>
        <span className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest">
            {label}
        </span>
    </div>
);

export default NextSessionCard;