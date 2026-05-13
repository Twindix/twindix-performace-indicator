import { Activity, Heart } from "lucide-react";
import { Outlet } from "react-router-dom";

import { Sidebar, Topbar } from "@/components/shared";
import { t, useAppInit, useSettings } from "@/hooks";
import { useSidebarStore } from "@/store";
import { cn } from "@/utils";

const InitLoader = () => (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-5 text-center px-6">
        <div className="relative">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
                <Activity className="h-7 w-7" />
            </div>
            <span aria-hidden className="absolute inset-0 rounded-2xl border-2 border-primary/40 animate-ping" />
        </div>
        <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold text-text-dark">{t("Preparing your workspace")}</p>
            <p className="text-xs text-text-muted">{t("Loading active project and sprint…")}</p>
        </div>
        <span aria-hidden className="h-1 w-32 overflow-hidden rounded-full bg-muted">
            <span className="block h-full w-1/3 bg-primary animate-[loading-bar_1.2s_ease-in-out_infinite]" />
        </span>
        <style>{`@keyframes loading-bar { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }`}</style>
    </div>
);

export const DashboardLayout = () => {
    const isOpen = useSidebarStore((s) => s.isOpen);
    const [settings] = useSettings();
    const { isReady } = useAppInit();

    if (!isReady) return <InitLoader />;

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Sidebar />
            <div className={cn("transition-all duration-300 flex-1 flex flex-col", isOpen ? "ms-[var(--spacing-sidebar)]" : "ms-16", "max-lg:ms-0")}>
                <Topbar />
                <main className={cn("flex-1 transition-all", settings.compactView ? "p-2 sm:p-3" : "p-3 sm:p-6")}>
                    <Outlet />
                </main>
                <footer className="border-t border-border py-4 px-6">
                    <p className="text-center text-sm text-text-muted flex items-center justify-center gap-1.5 group">
                        {t("Developed with")}
                        <Heart className="h-4 w-4 text-error animate-[heartbeat_1.5s_ease-in-out_infinite] group-hover:scale-125 transition-transform" />
                        {t("by")}
                        <a
                            href="https://hawary.dev"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-primary hover:text-primary-dark transition-colors duration-200 hover:underline underline-offset-2"
                        >
                            Mohamed Elhawary
                        </a>
                    </p>
                </footer>
            </div>
        </div>
    );
};
