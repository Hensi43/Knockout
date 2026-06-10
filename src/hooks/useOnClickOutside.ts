import { useEffect, RefObject } from "react";

/**
 * Custom hook that listens for clicks/touches outside of a specified element ref.
 * Ideal for closing modals, dropdowns, and popup cards.
 * 
 * @param ref The React RefObject of the container element
 * @param handler Callback function to execute when a click outside is registered
 */
export function useOnClickOutside<T extends HTMLElement = HTMLElement>(
    ref: RefObject<T | null>,
    handler: (event: MouseEvent | TouchEvent) => void
) {
    useEffect(() => {
        const listener = (event: MouseEvent | TouchEvent) => {
            const el = ref?.current;
            // Do nothing if clicking ref's element or its children
            if (!el || el.contains(event.target as Node)) {
                return;
            }
            handler(event);
        };

        document.addEventListener("mousedown", listener);
        document.addEventListener("touchstart", listener);

        return () => {
            document.removeEventListener("mousedown", listener);
            document.removeEventListener("touchstart", listener);
        };
    }, [ref, handler]);
}
