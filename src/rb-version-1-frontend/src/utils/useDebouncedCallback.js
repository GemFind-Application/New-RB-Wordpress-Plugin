import { useEffect, useMemo, useRef } from "react";

// Returns a stable debounced function that always invokes the latest `fn`
// (so it sees current state when it fires). Exposes cancel() and flush().
const useDebouncedCallback = (fn, delay = 500) => {
    const fnRef = useRef(fn);
    const timerRef = useRef(null);
    fnRef.current = fn;

    const debounced = useMemo(() => {
        const call = (...args) => {
            clearTimeout(timerRef.current);
            timerRef.current = setTimeout(() => {
                timerRef.current = null;
                fnRef.current(...args);
            }, delay);
        };
        call.cancel = () => {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        };
        call.flush = () => {
            if (timerRef.current) {
                call.cancel();
                fnRef.current();
            }
        };
        return call;
    }, [delay]);

    useEffect(() => debounced.cancel, [debounced]);

    return debounced;
};

export default useDebouncedCallback;
