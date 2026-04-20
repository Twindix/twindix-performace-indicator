import { useEffect, useRef, useState } from "react";

import { AUTH_UNAUTHORIZED_EVENT } from "@/lib/axios";
import { authService } from "@/services";

export type PresenceStatus = "active" | "away" | "offline";

export const usePresence = (userId: string | undefined) => {
    const [status, setStatus] = useState<PresenceStatus>("offline");
    const stoppedRef = useRef(false);

    const updateStatus = (next: PresenceStatus) => {
        if (!userId || stoppedRef.current) return;
        setStatus(next);
        authService.updateMeHandler({ presence_status: next }).catch(() => null);
    };

    useEffect(() => {
        if (!userId) return;
        stoppedRef.current = false;

        updateStatus("active");

        const handleVisibilityChange = () => {
            updateStatus(document.hidden ? "away" : "active");
        };

        const handleBeforeUnload = () => {
            updateStatus("offline");
        };

        const stop = () => {
            stoppedRef.current = true;
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("beforeunload", handleBeforeUnload);
        window.addEventListener(AUTH_UNAUTHORIZED_EVENT, stop);

        return () => {
            stop();
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("beforeunload", handleBeforeUnload);
            window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, stop);
        };
    }, [userId]);

    return { status, updateStatus };
};
