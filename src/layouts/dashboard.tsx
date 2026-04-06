import { Heart } from "lucide-react";
import { Outlet } from "react-router-dom";

import { Sidebar, Topbar } from "@/components/shared";
import { t, useSettings } from "@/hooks";
import { useSidebarStore } from "@/store";
import { cn } from "@/utils";

export const DashboardLayout = () => {
    const isOpen = useSidebarStore((s) => s.isOpen);
    useSettings(); // re-render on language change

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Sidebar />
            <div className={cn("transition-all duration-300 flex-1 flex flex-col", isOpen ? "ms-[var(--spacing-sidebar)]" : "ms-16", "max-lg:ms-0")}>
                <Topbar />
                <main className="p-3 sm:p-6 flex-1">
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
