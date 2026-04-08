import { Home, RefreshCw, ServerCrash } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/atoms";
import { routesData } from "@/data";

export const ServerErrorView = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
            <div className="w-full max-w-lg text-center animate-fade-in-up">
                <div className="rounded-2xl border border-border bg-card p-8 sm:p-10 shadow-lg">
                    {/* 500 Illustration */}
                    <div className="mb-6">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-error-light mb-4">
                            <ServerCrash className="h-10 w-10 text-error" />
                        </div>
                        <h1 className="text-6xl sm:text-7xl font-extrabold text-error mb-2">500</h1>
                    </div>

                    {/* Message */}
                    <h2 className="text-xl sm:text-2xl font-bold text-text-dark mb-2">Server Error</h2>
                    <p className="text-sm text-text-secondary mb-8 max-w-sm mx-auto">
                        Something went wrong on our end. Our team has been notified and is working on a fix. Please try again shortly.
                    </p>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button onClick={() => window.location.reload()} className="gap-2">
                            <RefreshCw className="h-4 w-4" />
                            Try Again
                        </Button>
                        <Button onClick={() => navigate(routesData.dashboard.path)} variant="outline" className="gap-2">
                            <Home className="h-4 w-4" />
                            Go to Dashboard
                        </Button>
                    </div>

                    {/* Footer */}
                    <p className="mt-8 text-[10px] text-text-muted">
                        Twindix Performance Indicator v0.1
                    </p>
                </div>
            </div>
        </div>
    );
};
