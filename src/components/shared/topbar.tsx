import { LogOut, Moon, Settings, Sun, User } from "lucide-react";
import { useEffect } from "react";
import { Bell, Flag, LogOut, Moon, Settings, Sun, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/atoms";
import { routesData } from "@/data";
import { useAuth, useSprintsList, useTheme, t, useSettings, usePresence, type PresenceStatus } from "@/hooks";
import { useSprintStore } from "@/store";
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
    // away:    { label: "Away",    dot: "bg-warning" },
    offline: { label: "Offline", dot: "bg-text-muted" },
};

export const Topbar = () => {
    const { user, onLogout } = useAuth();
    const { isDarkMode, onToggleTheme } = useTheme();
    const [settings] = useSettings();
    const { activeSprintId, onSetActiveSprint } = useSprintStore();
    const { sprints } = useSprintsList();
    const navigate = useNavigate();
    const { status, updateStatus } = usePresence(user?.id);

    useEffect(() => {
        if (sprints.length === 0) return;
        if (activeSprintId && sprints.some((s) => s.id === activeSprintId)) return;
        const active = sprints.find((s) => s.status === "active") ?? sprints[0];
        if (active) onSetActiveSprint(active.id);
    }, [sprints, activeSprintId, onSetActiveSprint]);

    const { count: redFlagCount } = { count: 0 }; // Placeholder for useRedFlags();
    const { count: pendingAlertCount } = { count: 0 }; // Placeholder for useAlerts();
    const { sprints, isLoading: isLoadingSprints } = useSprintsList();
    const navigate = useNavigate();
    const { status, updateStatus } = usePresence(user?.id);

    // Auto-select active sprint on load if currently empty or missing
    useEffect(() => {
        if (isLoadingSprints || sprints.length === 0) return;

        const currentExists = sprints.some(s => s.id === activeSprintId);
        if (!activeSprintId || !currentExists) {
            const activeSprint = sprints.find(s => s.status === 'active') || sprints[0];
            if (activeSprint) onSetActiveSprint(activeSprint.id);
        }
    }, [sprints, isLoadingSprints, activeSprintId, onSetActiveSprint]);

    const isArabic = settings.language === "ar";

    return (
        <header className="sticky top-0 z-30 flex h-14 sm:h-16 items-center justify-between border-b border-border bg-surface/80 backdrop-blur-sm px-3 sm:px-6">
            <div className="flex items-center gap-2 sm:gap-4">
                <MobileNav />
                <Select value={activeSprintId} onValueChange={onSetActiveSprint} disabled={isLoadingSprints}>
                    <SelectTrigger className="w-[140px] sm:w-[180px] h-9 text-xs sm:text-sm">
                        <SelectValue placeholder={isLoadingSprints ? t("Loading...") : t("Select Sprint")} />
                    </SelectTrigger>
                    <SelectContent>
                        {sprints.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                                <span className="flex items-center gap-1.5">
                                    {s.status === "active" && (
                                        <span className="h-2 w-2 rounded-full bg-success shrink-0" />
                                    )}
                                    {s.name}
                                </span>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex items-center gap-2">
                <TooltipProvider delayDuration={300}>
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

                        {(["active", "offline"] as PresenceStatus[]).map((s) => (
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
