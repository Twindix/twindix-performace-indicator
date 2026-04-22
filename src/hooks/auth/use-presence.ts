import { useEffect, useRef, useState } from "react";

import { AUTH_UNAUTHORIZED_EVENT } from "@/lib/axios";
import { runAction } from "@/lib/handle-action";
import { authService } from "@/services";

export type PresenceStatus = "active" | "offline";

export const usePresence = (userId: string | undefined) => {
    const [status, setStatus] = useState<PresenceStatus>("offline");
    const stoppedRef = useRef(false);

    const updateStatus = (next: PresenceStatus) => {
        if (!userId || stoppedRef.current) return;
        setStatus(next);
        runAction(() => authService.updateMeHandler({ presence_status: next }), {
            silent: true,
            context: "auth.presence",
        });
    };

    useEffect(() => {
        if (!userId) return;
        stoppedRef.current = false;

        updateStatus("active");

        const handleVisibilityChange = () => {
            updateStatus(document.hidden ? "offline" : "active");
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
