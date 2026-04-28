import { FolderKanban, LogOut, Moon, Pencil, Settings, Sun, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button, Input, Label } from "@/atoms";
import { routesData } from "@/data";
import { t } from "@/utils";
import { useAuth, useProjectsListLite, useSprintsList, useTheme, useSettings, usePermissions, usePresence, useUpdateSprint, type PresenceStatus } from "@/hooks";
import type { SprintInterface } from "@/interfaces";
import { useProjectStore, useSprintStore } from "@/store";
import { MobileNav } from "./mobile-nav";
import {
    Avatar,
    AvatarFallback,
    Dialog,
    DialogClose,
    DialogContent,
    DialogHeader,
    DialogTitle,
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

export const Topbar = () => {
    const { user, onLogout } = useAuth();
    const { isDarkMode, onToggleTheme } = useTheme();
    const [settings] = useSettings();
    const { activeSprintId, onSetActiveSprint } = useSprintStore();
    const { activeProjectId, onSetActiveProject } = useProjectStore();
    const { projects } = useProjectsListLite();
    const { sprints, refetch: refetchSprints } = useSprintsList();
    const { updateHandler: updateSprintHandler, isLoading: isSaving } = useUpdateSprint();
    const navigate = useNavigate();
    const p = usePermissions();
    const canEditProfile = p.auth.editProfile();
    const { status, updateStatus } = usePresence(user?.id, !canEditProfile);

    const [editOpen, setEditOpen] = useState(false);
    const [form, setForm] = useState({ name: "", start_date: "", end_date: "" });

    useEffect(() => {
        if (sprints.length === 0) return;
        if (activeSprintId && sprints.some((s) => s.id === activeSprintId)) return;
        const active = sprints.find((s) => s.status === "active") ?? sprints[0];
        if (active) onSetActiveSprint(active.id);
    }, [sprints, activeSprintId, onSetActiveSprint]);

    const isArabic = settings.language === "ar";
    const activeSprint: SprintInterface | undefined = sprints.find((s) => s.id === activeSprintId);

    const openEdit = () => {
        if (!activeSprint) return;
        setForm({
            name: activeSprint.name,
            start_date: activeSprint.start_date,
            end_date: activeSprint.end_date,
        });
        setEditOpen(true);
    };

    const handleSave = async () => {
        if (!activeSprint || !form.name.trim()) return;
        const res = await updateSprintHandler(activeSprint.id, {
            name: form.name.trim(),
            start_date: form.start_date,
            end_date: form.end_date,
        });
        if (res) {
            await refetchSprints();
            setEditOpen(false);
        }
    };

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
                            {projects.map((p) => (
                                <SelectItem key={p.id} value={p.id}>
                                    <span className="flex items-center gap-1.5">
                                        <FolderKanban className="h-3 w-3 text-primary shrink-0" />
                                        {p.name}
                                    </span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={activeSprintId} onValueChange={onSetActiveSprint}>
                        <SelectTrigger className="w-[140px] sm:w-[200px] h-9 text-xs sm:text-sm">
                            <SelectValue placeholder={t("Select Sprint")} />
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
                    <TooltipProvider delayDuration={300}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={openEdit}
                                    disabled={!activeSprint}
                                    className="h-9 w-9"
                                    aria-label={t("Edit sprint")}
                                >
                                    <Pencil className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>{t("Edit sprint")}</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>

            <div className="flex items-center gap-2">
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

            {/* Edit Sprint Dialog */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{t("Edit Sprint")}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-3">
                        <div className="space-y-2">
                            <Label htmlFor="sp-name">{t("Name")} <span className="text-error">*</span></Label>
                            <Input
                                id="sp-name"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder={t("Sprint name")}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label htmlFor="sp-start">{t("Start Date")}</Label>
                                <Input
                                    id="sp-start"
                                    type="date"
                                    value={form.start_date}
                                    onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="sp-end">{t("End Date")}</Label>
                                <Input
                                    id="sp-end"
                                    type="date"
                                    value={form.end_date}
                                    onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <DialogClose asChild>
                            <Button variant="outline" disabled={isSaving}>{t("Cancel")}</Button>
                        </DialogClose>
                        <Button onClick={handleSave} disabled={isSaving || !form.name.trim()}>
                            {isSaving ? t("Saving...") : t("Save Changes")}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </header>
    );
};
