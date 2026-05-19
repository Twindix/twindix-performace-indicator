import { WifiOff } from "lucide-react";

import { t, useOnlineStatus } from "@/hooks";
import { useNetworkErrorStore } from "@/store";

export const OfflineBanner = () => {
    const isOnline = useOnlineStatus();
    const hasNetworkError = useNetworkErrorStore(({ hasNetworkError }) => hasNetworkError);
    const onClearNetworkError = useNetworkErrorStore(({ onClearNetworkError }) => onClearNetworkError);

    const isVisible = !isOnline || hasNetworkError;

    if (!isVisible) return null;

    const handleRetry = () => {
        onClearNetworkError();
        window.location.reload();
    };

    return (
        <div className="fixed bottom-0 inset-x-0 z-50 bg-warning text-text-dark animate-fade-in-up">
            <div className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium">
                <WifiOff className="h-4 w-4 shrink-0" />
                <span>
                    {!isOnline
                        ? t("You're offline. Some features may not be available.")
                        : t("A network error occurred. Please check your connection.")}
                </span>
                <button
                    onClick={handleRetry}
                    className="ms-2 underline underline-offset-2 font-semibold hover:no-underline cursor-pointer"
                >
                    {t("Retry")}
                </button>
            </div>
        </div>
    );
};
