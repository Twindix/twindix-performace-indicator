import { Bell, Flag, Globe, HelpCircle, LogOut, Moon, Settings, Sun, User } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/atoms";
import { routesData } from "@/data";
import { useAuth, useTheme, t, useSettings, usePresence, type PresenceStatus } from "@/hooks";
import { useRedFlagStore, useSprintStore, useAlertStore } from "@/store";
import { storageKeys, getStorageItem } from "@/utils";
import type { SprintInterface } from "@/interfaces";
import { MobileNav } from "./mobile-nav";
import {
    Avatar,
    AvatarFallback,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/ui";

const presenceConfig: Record<PresenceStatus, { label: string; dot: string }> = {
    active:  { label: "Active",  dot: "bg-success" },
    away:    { label: "Away",    dot: "bg-warning" },
    offline: { label: "Offline", dot: "bg-text-muted" },
};

export const Topbar = () => {
    const { user, onLogout } = useAuth();
    const { isDarkMode, onToggleTheme } = useTheme();
    const [settings, updateSettings] = useSettings();
    const { activeSprintId, onSetActiveSprint } = useSprintStore();
    const { flags, load: loadFlags } = useRedFlagStore();
    const { alerts, load: loadAlerts } = useAlertStore();
    const sprints = getStorageItem<SprintInterface[]>(storageKeys.sprints) ?? [];
    const navigate = useNavigate();
    const { status, updateStatus } = usePresence(user?.id);

    useEffect(() => { loadFlags(); }, [loadFlags]);
    useEffect(() => { loadAlerts(); }, [loadAlerts]);

    const isArabic = settings.language === "ar";
    const redFlagCount = flags.filter((f) => f.sprintId === activeSprintId).length;

    const toggleLanguage = () => { updateSettings({ language: isArabic ? "en" : "ar" }); };

    const pendingAlertCount = alerts.filter((a) => {
        if (a.sprintId !== activeSprintId) return false;
        if (a.mentionedIds.length > 0 && !a.mentionedIds.includes(user?.id ?? "")) return false;
        return !a.resolvedByIds.includes(user?.id ?? "");
    }).length;

    return (
        <header className="sticky top-0 z-30 flex h-14 sm:h-16 items-center justify-between border-b border-border bg-surface/80 backdrop-blur-sm px-3 sm:px-6">
            <div className="flex items-center gap-2 sm:gap-4">
                <MobileNav />
                <Select value={activeSprintId} onValueChange={onSetActiveSprint}>
                    <SelectTrigger className="w-[140px] sm:w-[180px] h-9 text-xs sm:text-sm">
                        <SelectValue placeholder="Select Sprint" />
                    </SelectTrigger>
                    <SelectContent>
                        {sprints.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                                {s.name} {s.status === "active" && `(${t("Active")})`}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex items-center gap-2">
                <TooltipProvider delayDuration={300}>
                    {/* Red Flags indicator */}
                    {redFlagCount > 0 && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={() => navigate(routesData.redFlags)}
                                    className="relative flex items-center gap-1.5 h-9 px-2.5 rounded-[var(--radius-default)] text-error hover:bg-error-light transition-colors cursor-pointer"
                                    aria-label="Red Flags"
                                >
                                    <Flag className="h-4 w-4 animate-[flag-wave_1.8s_ease-in-out_infinite]" />
                                    <span className="text-xs font-semibold hidden sm:inline">
                                        {t("Red Flags")}
                                    </span>
                                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-error text-[10px] font-bold text-white px-1">
                                        {redFlagCount}
                                    </span>
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>{t("View all red flags for this sprint")}</TooltipContent>
                        </Tooltip>
                    )}

                    {/* Alerts indicator */}
                    {pendingAlertCount > 0 && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={() => navigate(routesData.alerts)}
                                    className="relative flex items-center gap-1.5 h-9 px-2.5 rounded-[var(--radius-default)] text-warning hover:bg-warning-light transition-colors cursor-pointer"
                                    aria-label="Alerts"
                                >
                                    <Bell className="h-4 w-4 animate-[bell-ring_2s_ease-in-out_infinite]" />
                                    <span className="text-xs font-semibold hidden sm:inline">{t("Alerts")}</span>
                                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-warning text-[10px] font-bold text-white px-1">
                                        {pendingAlertCount}
                                    </span>
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>{t("You have pending alerts")}</TooltipContent>
                        </Tooltip>
                    )}

                    {/* Language toggle */}
                    {/* stopping toggle Language button  */}
                    {/* <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={toggleLanguage} className="h-9 gap-1.5 px-2.5 text-xs font-semibold">
                                <Globe className="h-4 w-4" />
                                {isArabic ? "EN" : "عربي"}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>{isArabic ? "Switch to English" : "التبديل إلى العربية"}</TooltipContent>
                    </Tooltip> */}

                    {/* Theme toggle */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={onToggleTheme} className="h-9 w-9">
                                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>{isDarkMode ? t("Light") : t("Dark")}</TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                {/* Avatar dropdown */}
                <DropdownMenu dir={isArabic ? "rtl" : "ltr"}>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-2 rounded-full p-1 pe-3 hover:bg-accent transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                            <div className="relative">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="text-[10px]">{user?.avatar}</AvatarFallback>
                                </Avatar>
                                <span className={`absolute bottom-0 end-0 h-2.5 w-2.5 rounded-full border-2 border-surface ${presenceConfig[status].dot}`} />
                            </div>
                            <div className="hidden sm:flex flex-col items-start">
                                <span className="text-sm font-medium text-text-dark leading-tight">{user?.name}</span>
                                <span className="text-[10px] text-text-muted leading-tight flex items-center gap-1">
                                    <span className={`h-1.5 w-1.5 rounded-full ${presenceConfig[status].dot}`} />
                                    {t(presenceConfig[status].label)}
                                </span>
                            </div>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <div className="px-2 py-2.5">
                            <p className="text-sm font-semibold text-text-dark">{user?.name}</p>
                            <p className="text-xs text-text-muted">{user?.email}</p>
                        </div>
                        <DropdownMenuSeparator />

                        {(["active", "away", "offline"] as PresenceStatus[]).map((s) => (
                            <DropdownMenuItem key={s} onClick={() => updateStatus(s)} className="gap-2 cursor-pointer">
                                <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${presenceConfig[s].dot}`} />
                                {t(presenceConfig[s].label)}
                                {status === s && <span className="ms-auto text-[10px] text-text-muted">✓</span>}
                            </DropdownMenuItem>
                        ))}

                        <DropdownMenuSeparator />

                        <DropdownMenuItem onClick={() => navigate(routesData.profile)} className="gap-2 cursor-pointer">
                            <User className="h-4 w-4" />
                            {t("My Profile")}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(routesData.settings)} className="gap-2 cursor-pointer">
                            <Settings className="h-4 w-4" />
                            {t("Settings")}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(routesData.reports)} className="gap-2 cursor-pointer">
                            <HelpCircle className="h-4 w-4" />
                            {t("Help & Reports")}
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem onClick={onLogout} className="gap-2 text-error focus:text-error cursor-pointer">
                            <LogOut className="h-4 w-4" />
                            {t("Sign Out")}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
};
