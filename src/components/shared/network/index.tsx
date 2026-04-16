import { Wifi, WifiOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { msgsConstants } from "@/constants";
import { BrowserEventEnum } from "@/enums";
import { generateClassNameHandler } from "@/utils";

export const IndicatorNetworkError = () => {
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [isOffline, setIsOffline] = useState(!navigator.onLine);

    const [isRecovering, setIsRecovering] = useState(false);

    const isVisible = isOffline || isRecovering;

    const bannerMessage = isOffline ? msgsConstants.offlineBanner : msgsConstants.onlineBanner;

    useEffect(
        () => {
            const goOfflineHandler = () => {
                setIsOffline(true);
                setIsRecovering(false);
            };

            const goOnlineHandler = () => {
                setIsOffline(false);
                setIsRecovering(true);
            };

            window.addEventListener(BrowserEventEnum.OFFLINE, goOfflineHandler);
            window.addEventListener(BrowserEventEnum.ONLINE, goOnlineHandler);

            return () => {
                window.removeEventListener(BrowserEventEnum.OFFLINE, goOfflineHandler);
                window.removeEventListener(BrowserEventEnum.ONLINE, goOnlineHandler);
            };
        },
        [],
    );

    useEffect(
        () => {
            if (!isRecovering) return;

            timerRef.current = setTimeout(
                () => setIsRecovering(false),
                3000,
            );

            return () => {
                if (timerRef.current) clearTimeout(timerRef.current);
            };
        },
        [isRecovering],
    );

    return (
        <div
            className={generateClassNameHandler(
                "fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-primary-foreground transition-transform duration-300 ease-in-out",
                isVisible ? "translate-y-0" : "translate-y-full",
                isOffline ? "bg-error" : "bg-success",
            )}
        >
            {isOffline ? <WifiOff className="size-4" /> : <Wifi className="size-4" />}
            <span>{bannerMessage}</span>
        </div>
    );
};
