import { useRouteError } from "react-router-dom";
import { AlertTriangle, RefreshCw } from "lucide-react";

import { Button } from "@/atoms";
import { t } from "@/hooks";

export const RouteError = () => {
    const error = useRouteError();
    const message = error instanceof Error ? error.message : t("An unexpected error occurred");
    return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
            <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 shadow-lg text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-error-light mb-6">
                    <AlertTriangle className="h-8 w-8 text-error" />
                </div>
                <h1 className="text-2xl font-bold text-text-dark mb-2">{t("Something Went Wrong")}</h1>
                <p className="text-sm text-text-secondary mb-6">{t("An unexpected error occurred while loading this page.")}</p>
                <div className="rounded-xl bg-muted p-4 mb-6 text-start">
                    <p className="text-xs font-mono text-error break-all">{message}</p>
                </div>
                <div className="flex gap-3 justify-center">
                    <Button onClick={() => window.location.reload()} className="gap-2">
                        <RefreshCw className="h-4 w-4" />
                        {t("Reload Page")}
                    </Button>
                    <Button variant="outline" onClick={() => window.location.href = "/"}>
                        {t("Go to Dashboard")}
                    </Button>
                </div>
            </div>
        </div>
    );
};
