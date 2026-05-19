import { FolderKanban, LogOut, Moon, Settings, Sun, User } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/atoms";
import { routesData } from "@/data";
import { useAuth, useProjectSprints, useProjectsListLite, useTheme, t, useSettings, usePermissions, usePresence, type PresenceStatus } from "@/hooks";
import type { SprintInterface } from "@/interfaces";
import { useProjectStore, useSprintStore } from "@/store";
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
    offline: { label: "Offline", dot: "bg-text-muted" },
};

const EmptyOption = ({ label }: { label: string }) => (
    <div className="px-2 py-1.5 text-xs text-text-muted italic select-none">
        {label}
    </div>
);

export const Topbar = () => {
    const { user, onLogout } = useAuth();
    const { isDarkMode, onToggleTheme } = useTheme();
    const [settings, updateSettings] = useSettings();

    // Subscribe with selectors so each store update only re-renders the slice that changed.
    const activeSprintId = useSprintStore((s) => s.activeSprintId);
    const onSetActiveSprint = useSprintStore((s) => s.onSetActiveSprint);
    const activeProjectId = useProjectStore((s) => s.activeProjectId);
    const onSetActiveProject = useProjectStore((s) => s.onSetActiveProject);

    const { projects } = useProjectsListLite();
    // Use the cached reader — `useAppInit` seeded it on cold start, and sprint
    // mutations invalidate it. Avoids a duplicate /projects/:id/sprints fetch.
    const { sprints, isLoading: sprintsLoading } = useProjectSprints(activeProjectId);
    const navigate = useNavigate();
    const p = usePermissions();
    const canEditProfile = p.auth.editProfile();
    const { status, updateStatus } = usePresence(user?.id, !canEditProfile);

    // Only active sprints belong in a selector. Memoize so the next effect's dep array
    // is stable across renders that don't actually change the sprint list.
    const selectableSprints: SprintInterface[] = useMemo(
        () => sprints.filter((s) => s.status !== "completed"),
        [sprints],
    );

    // Reactive fallback: if the persisted sprint becomes invalid (deleted, project switch
    // drops it from the list, etc.) jump to the first active sprint. Skip while sprints
    // are still loading — the empty list is transient and must not clear the stored sprint.
    useEffect(() => {
        if (sprintsLoading) return;
        if (selectableSprints.length === 0) {
            if (activeSprintId) onSetActiveSprint("");
            return;
        }
        if (activeSprintId && selectableSprints.some((s) => s.id === activeSprintId)) return;
        onSetActiveSprint(selectableSprints[0].id);
    }, [selectableSprints, activeSprintId, onSetActiveSprint, sprintsLoading]);

    const isArabic = settings.language === "ar";

    return (
        <header className="sticky top-0 z-30 flex h-14 sm:h-16 items-center justify-between border-b border-border bg-surface/80 backdrop-blur-sm px-3 sm:px-6">
            <div className="flex items-center gap-2 sm:gap-4">
                <MobileNav />
                <div className="flex items-center gap-1.5">
                    <Select value={activeProjectId} onValueChange={onSetActiveProject}>
                        <SelectTrigger className="w-[130px] sm:w-[180px] h-9 text-xs sm:text-sm">
                            <SelectValue placeholder={t("Select Project")} />
                        </SelectTrigger>
                        <SelectContent>
                            {projects.length === 0 ? (
                                <EmptyOption label={t("No projects yet")} />
                            ) : (
                                projects.map((proj) => (
                                    <SelectItem key={proj.id} value={proj.id}>
                                        <span className="flex items-center gap-1.5">
                                            <FolderKanban className="h-3 w-3 text-primary shrink-0" />
                                            {proj.name}
                                        </span>
                                    </SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>

                    <Select value={activeSprintId} onValueChange={onSetActiveSprint} disabled={!activeProjectId}>
                        <SelectTrigger className="w-[140px] sm:w-[200px] h-9 text-xs sm:text-sm">
                            <SelectValue placeholder={activeProjectId ? t("Select Sprint") : t("Pick a project first")} />
                        </SelectTrigger>
                        <SelectContent>
                            {!activeProjectId ? (
                                <EmptyOption label={t("Pick a project first")} />
                            ) : selectableSprints.length === 0 ? (
                                <EmptyOption label={t("No active sprints")} />
                            ) : (
                                selectableSprints.map((s) => (
                                    <SelectItem key={s.id} value={s.id}>
                                        <span className="flex items-center gap-1.5">
                                            <span className="h-2 w-2 rounded-full bg-success shrink-0" />
                                            {s.name}
                                        </span>
                                    </SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <TooltipProvider delayDuration={300}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateSettings({ language: isArabic ? "en" : "ar" })}
                                className="h-9 px-2 text-xs font-bold tracking-wide"
                            >
                                {isArabic ? "EN" : "ع"}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>{isArabic ? t("English") : t("Arabic")}</TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <TooltipProvider delayDuration={300}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={onToggleTheme} className="h-9 w-9">
                                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>{isDarkMode ? t("Light") : t("Dark")}</TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <DropdownMenu dir={isArabic ? "rtl" : "ltr"}>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-2 rounded-full p-1 pe-3 hover:bg-accent transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                            <div className="relative">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="text-[10px]">{user?.avatar_initials}</AvatarFallback>
                                </Avatar>
                                <span className={`absolute bottom-0 end-0 h-2.5 w-2.5 rounded-full border-2 border-surface ${presenceConfig[status].dot}`} />
                            </div>
                            <div className="hidden sm:flex flex-col items-start">
                                <span className="text-sm font-medium text-text-dark leading-tight">{user?.full_name}</span>
                                <span className="text-[10px] text-text-muted leading-tight flex items-center gap-1">
                                    <span className={`h-1.5 w-1.5 rounded-full ${presenceConfig[status].dot}`} />
                                    {t(presenceConfig[status].label)}
                                </span>
                            </div>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <div className="px-2 py-2.5">
                            <p className="text-sm font-semibold text-text-dark">{user?.full_name}</p>
                            <p className="text-xs text-text-muted">{user?.email}</p>
                        </div>
                        <DropdownMenuSeparator />

                        {canEditProfile && (["active", "offline"] as PresenceStatus[]).map((s) => (
                            <DropdownMenuItem key={s} onClick={() => updateStatus(s)} className="gap-2 cursor-pointer">
                                <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${presenceConfig[s].dot}`} />
                                {t(presenceConfig[s].label)}
                                {status === s && <span className="ms-auto text-[10px] text-text-muted">✓</span>}
                            </DropdownMenuItem>
                        ))}

                        {canEditProfile && <DropdownMenuSeparator />}

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
