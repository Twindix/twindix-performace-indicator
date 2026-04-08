import { useEffect, useState } from "react";

import { getStorageItem, setStorageItem } from "@/utils";

const PRESENCE_KEY = "twindix_perf_presence";

export type PresenceStatus = "active" | "away" | "offline";

export const usePresence = (userId: string | undefined) => {
    const [status, setStatus] = useState<PresenceStatus>(() => {
        if (!userId) return "offline";
        const stored = getStorageItem<Record<string, PresenceStatus>>(PRESENCE_KEY) ?? {};
        return stored[userId] ?? "offline";
    });

    const updateStatus = (next: PresenceStatus) => {
        if (!userId) return;
        const stored = getStorageItem<Record<string, PresenceStatus>>(PRESENCE_KEY) ?? {};
        stored[userId] = next;
        setStorageItem(PRESENCE_KEY, stored);
        setStatus(next);
    };

    useEffect(() => {
        if (!userId) return;
        // Mark active on mount
        updateStatus("active");

        const handleVisibilityChange = () => {
            updateStatus(document.hidden ? "away" : "active");
        };

        const handleBeforeUnload = () => {
            updateStatus("offline");
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("beforeunload", handleBeforeUnload);
            updateStatus("offline");
        };
    }, [userId]);

    return { status, updateStatus };
};
