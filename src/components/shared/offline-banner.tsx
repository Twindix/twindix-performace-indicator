import { WifiOff } from "lucide-react";

import { useOnlineStatus } from "@/hooks";

export const OfflineBanner = () => {
    const isOnline = useOnlineStatus();

    if (isOnline) return null;

    return (
        <div className="fixed bottom-0 inset-x-0 z-50 bg-warning text-text-dark animate-fade-in-up">
            <div className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium">
                <WifiOff className="h-4 w-4 shrink-0" />
                <span>You're offline. Some features may not be available.</span>
                <button
                    onClick={() => window.location.reload()}
                    className="ms-2 underline underline-offset-2 font-semibold hover:no-underline cursor-pointer"
                >
                    Retry
                </button>
            </div>
        </div>
    );
};
