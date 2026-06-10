import { useState, useEffect } from "react";

/**
 * Custom hook to track snooker table play session stats in real time.
 * Calculates duration (elapsed time formatted as HH:MM:SS) and current billing cost.
 * 
 * @param startTime Starting timestamp of the session (ISO string or Date)
 * @param hourlyRate Hourly billing rate of the table in Rupees
 * @returns Object containing formatted time, current cost, and elapsed minutes
 */
export function useSessionTimer(startTime: string | Date, hourlyRate: number) {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const start = new Date(startTime);
    const diffInMs = Math.max(0, currentTime.getTime() - start.getTime());
    const diffInMinutes = diffInMs / (1000 * 60);
    const ratePerMin = hourlyRate / 60;
    
    // Cost calculation (aligned with decimal / round check-out rules)
    const accruedCost = Math.round(diffInMinutes * ratePerMin);
    
    // Format to HH:MM:SS
    const hours = Math.floor(diffInMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffInMs % (1000 * 60)) / 1000);
    const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

    return {
        formattedTime,
        accruedCost,
        minutesElapsed: Math.floor(diffInMinutes),
    };
}
