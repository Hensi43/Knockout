import { useState, useEffect } from "react";

/**
 * Custom hook to monitor media queries dynamically in React.
 * Handles SSR gracefully by checking for window presence.
 * 
 * @param query The media query string to match (e.g., "(max-width: 768px)")
 * @returns boolean indicating whether the media query is currently matched
 */
export function useMediaQuery(query: string): boolean {
    // Check match status safely on client-side
    const getMatches = (query: string): boolean => {
        if (typeof window !== "undefined") {
            return window.matchMedia(query).matches;
        }
        return false;
    };

    const [matches, setMatches] = useState<boolean>(false);

    useEffect(() => {
        // Set initial value
        setMatches(getMatches(query));

        const mediaQueryList = window.matchMedia(query);
        
        // Define callback to handle updates
        const listener = (event: MediaQueryListEvent) => {
            setMatches(event.matches);
        };

        // Modern browsers support addEventListener, fallback to addListener for older ones
        if (mediaQueryList.addEventListener) {
            mediaQueryList.addEventListener("change", listener);
        } else {
            mediaQueryList.addListener(listener);
        }

        return () => {
            if (mediaQueryList.removeEventListener) {
                mediaQueryList.removeEventListener("change", listener);
            } else {
                mediaQueryList.removeListener(listener);
            }
        };
    }, [query]);

    return matches;
}
