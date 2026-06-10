import { useState, useEffect } from "react";

/**
 * Custom hook to debounce updates to a state value.
 * Useful for delaying search queries or filter applications until input pauses.
 * 
 * @param value The value to debounce
 * @param delay The delay in milliseconds (default: 300)
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}
