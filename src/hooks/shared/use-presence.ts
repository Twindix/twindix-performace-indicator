import { useEffect, useState } from "react";

import { authConstants } from "@/constants/auth";
import { authService } from "@/services";

export type PresenceStatus = "active" | "away" | "offline";

export const usePresence = (userId: string | undefined) => {
    const [status, setStatus] = useState<PresenceStatus>("offline");

    const updateStatus = (next: PresenceStatus) => {
        if (!userId) return;
        setStatus(next);
        authService.updateMeHandler({ status: next }).catch(() => null);
    };

    useEffect(() => {
        if (!userId) return;

        updateStatus("active");

        const handleVisibilityChange = () => {
            updateStatus(document.hidden ? "away" : "active");
        };

        const handleBeforeUnload = () => {
            updateStatus("offline");
        };

        const interval = setInterval(() => {
            authService.heartbeatHandler().catch(() => null);
        }, authConstants.heartbeatIntervalMs);

        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            clearInterval(interval);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [userId]);

    return { status, updateStatus };
};
