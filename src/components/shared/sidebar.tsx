import { Activity, ChevronLeft } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import { cn } from "@/utils";
import { sidebarItems } from "@/data";
import { t, useSettings } from "@/hooks";
import { useSidebarStore } from "@/store";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/ui";

export const Sidebar = () => {
    const { pathname } = useLocation();
    const { isOpen, onToggle } = useSidebarStore();
    useSettings();

    return (
        <aside className={cn("fixed inset-inline-start-0 top-0 z-40 flex h-screen flex-col border-e border-border bg-surface transition-all duration-300", isOpen ? "w-[var(--spacing-sidebar)]" : "w-16")}>
            <div className="flex h-16 items-center gap-3 border-b border-border px-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-default)] bg-primary text-primary-foreground">
                    <Activity className="h-5 w-5" />
                </div>
                {isOpen && (
                    <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-bold text-text-dark truncate">Twindix</span>
                        <span className="text-[10px] text-text-muted truncate">Performance Indicator</span>
                    </div>
                )}
                <button onClick={onToggle} className={cn("ms-auto rounded-lg p-1.5 text-text-muted hover:bg-accent hover:text-text-dark transition-colors cursor-pointer", !isOpen && "ms-0 mt-1")}>
                    <ChevronLeft className={cn("h-4 w-4 transition-transform", !isOpen && "rotate-180")} />
                </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-2 scrollbar-thin">
                <TooltipProvider delayDuration={0}>
                    <ul className="flex flex-col gap-1">
                        {sidebarItems.map(({ label, path, icon: Icon }) => {
                            const isActive = pathname === path;
                            const linkContent = (
                                <Link to={path} className={cn("flex items-center gap-3 rounded-[var(--radius-default)] px-3 py-2.5 text-sm font-medium transition-all duration-200", isActive ? "bg-primary-lighter text-primary-medium shadow-sm" : "text-text-secondary hover:bg-accent hover:text-text-dark", !isOpen && "justify-center px-0")}>
                                    <Icon className="h-5 w-5 shrink-0" />
                                    {isOpen && <span className="truncate">{t(label)}</span>}
                                </Link>
                            );

                            if (!isOpen) {
                                return (
                                    <li key={path}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                                            <TooltipContent side="right">{t(label)}</TooltipContent>
                                        </Tooltip>
                                    </li>
                                );
                            }

                            return <li key={path}>{linkContent}</li>;
                        })}
                    </ul>
                </TooltipProvider>
            </nav>

            {isOpen && (
                <div className="border-t border-border p-4">
                    <p className="text-[10px] text-text-muted text-center">Twindix Performance Indicator v0.1</p>
                </div>
            )}
        </aside>
    );
};
