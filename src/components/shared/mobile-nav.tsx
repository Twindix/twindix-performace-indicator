import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Activity, Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import { sidebarItems } from "@/data";
import { t, useSettings } from "@/hooks";
import { cn } from "@/utils";

export const MobileNav = () => {
    const [open, setOpen] = useState(false);
    const { pathname } = useLocation();
    useSettings();

    // Lock body scroll when drawer is open
    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [open]);

    return (
        <div className="lg:hidden">
            <button onClick={() => setOpen(true)} className="p-2 rounded-lg hover:bg-accent transition-colors cursor-pointer">
                <Menu className="h-5 w-5 text-text-dark" />
            </button>

            {createPortal(
                <>
                    {/* Overlay */}
                    {open && (
                        <div className="fixed inset-0 z-[60] animate-fade-in lg:hidden" onClick={() => setOpen(false)}>
                            <div className="absolute inset-0 bg-black/40" />
                        </div>
                    )}

                    {/* Drawer */}
                    <div className={cn(
                        "fixed top-0 bottom-0 z-[70] w-[280px] bg-surface border-e border-border flex flex-col transition-transform duration-300 ease-in-out lg:hidden",
                        "left-0 rtl:left-auto rtl:right-0",
                        open ? "translate-x-0 rtl:translate-x-0" : "-translate-x-full rtl:translate-x-full",
                    )}>
                        {/* Header */}
                        <div className="flex h-14 items-center justify-between px-4 border-b border-border">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-default)] bg-primary text-primary-foreground">
                                    <Activity className="h-5 w-5" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-text-dark">{t("Twindix")}</span>
                                    <span className="text-[10px] text-text-muted">{t("Performance Indicator")}</span>
                                </div>
                            </div>
                            <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-accent transition-colors cursor-pointer">
                                <X className="h-4 w-4 text-text-muted" />
                            </button>
                        </div>

                        {/* Nav */}
                        <nav className="flex-1 overflow-y-auto p-2 scrollbar-thin">
                            <ul className="flex flex-col gap-1">
                                {sidebarItems.map(({ label, path, icon: Icon }) => {
                                    const isActive = pathname === path;
                                    return (
                                        <li key={path}>
                                            <Link
                                                to={path}
                                                onClick={() => setOpen(false)}
                                                className={cn(
                                                    "flex items-center gap-3 rounded-[var(--radius-default)] px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                                    isActive
                                                        ? "bg-primary-lighter text-primary-medium shadow-sm"
                                                        : "text-text-secondary hover:bg-accent hover:text-text-dark",
                                                )}
                                            >
                                                <Icon className="h-5 w-5 shrink-0" />
                                                <span>{t(label)}</span>
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </nav>

                        <div className="border-t border-border p-4">
                            <p className="text-[10px] text-text-muted text-center">{t("Twindix Performance Indicator v0.1")}</p>
                        </div>
                    </div>
                </>,
                document.body,
            )}
        </div>
    );
};
