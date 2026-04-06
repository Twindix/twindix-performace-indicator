import { ArrowLeft, Home, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/atoms";
import { routesData } from "@/data";

export const NotFoundView = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
            <div className="w-full max-w-lg text-center animate-fade-in-up">
                <div className="rounded-2xl border border-border bg-card p-8 sm:p-10 shadow-lg">
                    {/* 404 Illustration */}
                    <div className="mb-6">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary-lighter mb-4">
                            <Search className="h-10 w-10 text-primary" />
                        </div>
                        <h1 className="text-6xl sm:text-7xl font-extrabold text-primary mb-2">404</h1>
                    </div>

                    {/* Message */}
                    <h2 className="text-xl sm:text-2xl font-bold text-text-dark mb-2">Page Not Found</h2>
                    <p className="text-sm text-text-secondary mb-8 max-w-sm mx-auto">
                        The page you're looking for doesn't exist or has been moved. Let's get you back on track.
                    </p>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button onClick={() => navigate(-1)} variant="outline" className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Go Back
                        </Button>
                        <Button onClick={() => navigate(routesData.dashboard)} className="gap-2">
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
