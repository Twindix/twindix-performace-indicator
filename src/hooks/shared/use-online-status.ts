import { useEffect, useSyncExternalStore } from "react";

const subscribe = (callback: () => void) => {
    window.addEventListener("online", callback);
    window.addEventListener("offline", callback);
    return () => {
        window.removeEventListener("online", callback);
        window.removeEventListener("offline", callback);
    };
};

const getSnapshot = () => navigator.onLine;

export const useOnlineStatus = () => {
    const isOnline = useSyncExternalStore(subscribe, getSnapshot);

    useEffect(() => {
        if (!isOnline) {
            console.warn("[Twindix] Network connection lost");
        }
    }, [isOnline]);

    return isOnline;
};
