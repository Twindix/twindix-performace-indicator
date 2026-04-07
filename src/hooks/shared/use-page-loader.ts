import { useState, useEffect } from "react";

export const usePageLoader = (delay = 800): boolean => {
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), delay);
        return () => clearTimeout(timer);
    }, [delay]);
    return isLoading;
};
