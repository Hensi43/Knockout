import { useState, useEffect, useCallback, Dispatch, SetStateAction } from "react";

/**
 * Custom hook to manage states synchronized with browser localStorage.
 * Handles Next.js Server-Side Rendering (SSR) environments safely.
 * 
 * @param key The localStorage key name
 * @param initialValue The default fallback value if no item exists in localStorage
 */
export function useLocalStorage<T>(
    key: string,
    initialValue: T
): [T, Dispatch<SetStateAction<T>>] {
    // Read the value on initial hook mounting
    const [storedValue, setStoredValue] = useState<T>(() => {
        if (typeof window === "undefined") {
            return initialValue;
        }
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error("Error reading localStorage key:", key, error);
            return initialValue;
        }
    });

    // Wrapped setting function that persists value to localStorage
    const setValue = useCallback(
        (value: SetStateAction<T>) => {
            try {
                // Support functional updates
                const valueToStore =
                    value instanceof Function ? value(storedValue) : value;
                
                setStoredValue(valueToStore);
                
                if (typeof window !== "undefined") {
                    window.localStorage.setItem(key, JSON.stringify(valueToStore));
                }
            } catch (error) {
                console.error("Error setting localStorage key:", key, error);
            }
        },
        [key, storedValue]
    );

    return [storedValue, setValue];
}
