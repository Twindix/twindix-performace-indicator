import { Activity, ChevronLeft } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import { cn } from "@/utils";
import { sidebarItems } from "@/data";
import { t } from "@/hooks";
import { useSettings } from "@/hooks";
import { useSidebarStore } from "@/store";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/ui";

export const Sidebar = () => {
    const { pathname } = useLocation();
    const { isOpen, onToggle } = useSidebarStore();
    useSettings();

    return (
        <aside className={cn("fixed inset-inline-start-0 top-0 z-40 flex h-screen flex-col border-e border-border bg-surface transition-all duration-300", isOpen ? "w-[var(--spacing-sidebar)]" : "w-16", "max-lg:hidden")}>
            <div className="flex h-16 items-center gap-3 border-b border-border px-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-default)] bg-primary text-primary-foreground">
                    <Activity className="h-5 w-5" />
                </div>
                {isOpen && (
                    <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-bold text-text-dark truncate">{t("Twindix")}</span>
                        <span className="text-[10px] text-text-muted truncate">{t("Performance Indicator")}</span>
                    </div>
                )}
            </div>

            <button onClick={onToggle} className="absolute top-7 -end-3.5 z-50 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-surface shadow-md text-text-muted hover:text-text-dark hover:bg-accent transition-colors cursor-pointer">
                <ChevronLeft className={cn("h-4 w-4 transition-transform", !isOpen ? "rotate-180 rtl:rotate-0" : "rtl:rotate-180")} />
            </button>

            <nav className="flex-1 overflow-y-auto p-2 scrollbar-thin">
                <TooltipProvider delayDuration={0}>
                    <ul className="flex flex-col gap-1">
                        {sidebarItems.map(({ label, path, icon: Icon, disabled }) => {
                            const isActive = path === "/" ? pathname === path : pathname === path || pathname.startsWith(`${path}/`);

                            if (disabled) {
                                const disabledEl = (
                                    <span className={cn("flex items-center gap-3 rounded-[var(--radius-default)] px-3 py-2.5 text-sm font-medium text-text-muted cursor-not-allowed select-none bg-muted/30", !isOpen && "justify-center px-0")}>
                                        <Icon className="h-5 w-5 shrink-0" />
                                        {isOpen && <span className="truncate">{t(label)}</span>}
                                    </span>
                                );
                                return (
                                    <li key={path}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>{disabledEl}</TooltipTrigger>
                                            <TooltipContent side="right">{t(label)} — {t("Coming soon")}</TooltipContent>
                                        </Tooltip>
                                    </li>
                                );
                            }

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
                    <p className="text-[10px] text-text-muted text-center">{t("Twindix Performance Indicator v0.1")}</p>
                </div>
            )}
        </aside>
    );
};
