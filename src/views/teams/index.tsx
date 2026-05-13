import { useState } from "react";
import { Edit, LineChart, MoreHorizontal, Plus, Trash2, Users } from "lucide-react";

import { Button, Card, CardContent, Input, Label, Textarea } from "@/atoms";
import { EmptyState, Header, Pagination, QueryBoundary } from "@/components/shared";
import { TeamsSkeleton } from "@/components/skeletons";
import { analyticsSeed } from "@/data";
import { t, useCreateTeam, useDeleteTeam, useFormErrors, useGetTeams, usePermissions, useUpdateTeam } from "@/hooks";
import type { TeamInterface } from "@/interfaces";
import {
    Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle,
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/ui";
import { TeamAnalyticsView } from "./TeamAnalyticsView";
import { TeamDetailDialog } from "./TeamDetailDialog";

export const TeamsView = () => {
    const p = usePermissions();
    const { teams, meta, isLoading, setPage, setPerPage, patchTeamLocal, removeTeamLocal } = useGetTeams();
    const { setFieldErrors, clearError, clear: clearFieldErrors, getError } = useFormErrors();
    const { createHandler, isLoading: isCreating } = useCreateTeam({ onFieldErrors: setFieldErrors });
    const { updateHandler, isLoading: isUpdating } = useUpdateTeam({ onFieldErrors: setFieldErrors });
    const { deleteHandler, isLoading: isDeleting } = useDeleteTeam();
    const [addOpen, setAddOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<TeamInterface | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<TeamInterface | null>(null);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [detailTeamId, setDetailTeamId] = useState<string | null>(null);
    const [analyticsTeam, setAnalyticsTeam] = useState<TeamInterface | null>(null);

    const isSubmitting = isCreating || isUpdating;

    const openEdit = (team: TeamInterface) => {
        setEditTarget(team);
        setName(team.name);
        setDescription("");
        clearFieldErrors();
    };

    const unwrapTeam = (res: unknown): TeamInterface | null => {
        if (!res || typeof res !== "object") return null;
        if ("data" in res && (res as { data: unknown }).data) return (res as { data: TeamInterface }).data;
        if ("id" in res) return res as TeamInterface;
        return null;
    };

    const handleSubmit = async () => {
        if (!name.trim()) return;
        if (editTarget) {
            const res = await updateHandler(editTarget.id, { name: name.trim(), description: description.trim() || undefined });
            const team = unwrapTeam(res);
            if (team) { patchTeamLocal(team); closeDialog(); }
            return;
        }
        const res = await createHandler({ name: name.trim(), description: description.trim() || undefined });
        const team = unwrapTeam(res);
        if (team) { patchTeamLocal(team); closeDialog(); }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        const ok = await deleteHandler(deleteTarget.id);
        if (ok) { removeTeamLocal(deleteTarget.id); setDeleteTarget(null); }
    };

    const closeDialog = () => { setAddOpen(false); setEditTarget(null); setName(""); setDescription(""); clearFieldErrors(); };

    if (analyticsTeam) {
        return (
            <TeamAnalyticsView
                team={analyticsTeam}
                onBack={() => setAnalyticsTeam(null)}
                onViewMembers={() => {
                    setDetailTeamId(analyticsTeam.id);
                    setAnalyticsTeam(null);
                }}
            />
        );
    }

    return (
        <div className="flex-1 flex flex-col">
            <Header
                title={t("Teams")}
                description={t("Organize members into teams.")}
                actions={
                    p.teams.create() ? (
                        <Button size="sm" className="gap-1.5" onClick={() => { clearFieldErrors(); setAddOpen(true); }}>
                            <Plus className="h-4 w-4" />
                            {t("Add Team")}
                        </Button>
                    ) : null
                }
            />

            <QueryBoundary
                isLoading={isLoading && teams.length === 0}
                skeleton={<TeamsSkeleton />}
                empty={teams.length === 0}
                emptyState={<EmptyState icon={Users} title={t("No teams yet")} description={t("Create your first team to group members.")} />}
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {teams.filter((team) => team.id !== deleteTarget?.id).map((team) => {
                        const a = analyticsSeed.teams[team.id] ?? analyticsSeed.fallback.team;
                        const completion = Math.round((a.tasks_done / Math.max(a.tasks_total, 1)) * 100);
                        return (
                        <Card
                            key={team.id}
                            className="group relative overflow-hidden transition-all duration-200 hover:border-primary/40 hover:shadow-[0_4px_16px_-6px_rgba(0,0,0,0.12)] hover:-translate-y-0.5"
                        >
                            <span aria-hidden className="pointer-events-none absolute inset-y-0 start-0 w-0.5 bg-primary scale-y-0 origin-top transition-transform duration-300 group-hover:scale-y-100" />
                            <CardContent className="p-5 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-lighter text-primary-medium shrink-0 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                                        <Users className="h-5 w-5" />
                                    </div>
                                    <h3 className="text-base font-semibold text-text-dark truncate flex-1">{team.name}</h3>
                                    {p.teams.manage() && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => openEdit(team)} className="gap-2 cursor-pointer">
                                                    <Edit className="h-4 w-4" /> {t("Edit")}
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => setDeleteTarget(team)} className="gap-2 text-error focus:text-error cursor-pointer">
                                                    <Trash2 className="h-4 w-4" /> {t("Delete")}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                    <TeamCardStat label={t("Members")} value={a.members_active} tone="primary" />
                                    <TeamCardStat label={t("On-time")} value={`${a.on_time_rate}%`} tone="success" />
                                    <TeamCardStat label={t("Completion")} value={`${completion}%`} tone="primary" />
                                </div>

                                <div>
                                    <div className="flex items-center justify-between text-[11px] text-text-muted mb-1">
                                        <span>{t("Tasks")}</span>
                                        <span>{a.tasks_done} / {a.tasks_total}</span>
                                    </div>
                                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                        <div className="h-full bg-primary-medium" style={{ width: `${completion}%` }} />
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 pt-1">
                                    <Button size="sm" variant="outline" className="flex-1 gap-1.5" onClick={() => setAnalyticsTeam(team)}>
                                        <LineChart className="h-3.5 w-3.5" />
                                        {t("Analytics")}
                                    </Button>
                                    <Button size="sm" className="flex-1 gap-1.5" onClick={() => setDetailTeamId(team.id)}>
                                        <Users className="h-3.5 w-3.5" />
                                        {t("Members")}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                        );
                    })}
                </div>

                <Pagination
                    meta={meta}
                    onPageChange={setPage}
                    onPerPageChange={setPerPage}
                    isLoading={isLoading}
                    label="teams"
                />
            </QueryBoundary>

            <Dialog open={addOpen || editTarget !== null} onOpenChange={(open) => !open && closeDialog()}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editTarget ? t("Edit Team") : t("Add Team")}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 mt-2">
                        <div className="space-y-2">
                            <Label htmlFor="team-name">{t("Name")} <span className="text-error">*</span></Label>
                            <Input id="team-name" value={name} onChange={(e) => { setName(e.target.value); clearError("name"); }} placeholder={t("Frontend")} />
                            {getError("name") && <p className="text-xs text-error">{getError("name")}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="team-desc">{t("Description")}</Label>
                            <Textarea id="team-desc" rows={3} value={description} onChange={(e) => { setDescription(e.target.value); clearError("description"); }} placeholder={t("What does this team do?")} />
                            {getError("description") && <p className="text-xs text-error">{getError("description")}</p>}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                        <DialogClose asChild>
                            <Button variant="outline" disabled={isSubmitting}>{t("Cancel")}</Button>
                        </DialogClose>
                        <Button onClick={handleSubmit} loading={isSubmitting} disabled={!name.trim()}>
                            {editTarget ? t("Save Changes") : t("Create Team")}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>{t("Delete Team")}</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-text-muted mt-2">
                        {t("Remove")} <strong>{deleteTarget?.name}</strong>?
                    </p>
                    <div className="flex justify-end gap-2 mt-4">
                        <DialogClose asChild>
                            <Button variant="outline" disabled={isDeleting}>{t("Cancel")}</Button>
                        </DialogClose>
                        <Button variant="destructive" onClick={handleDelete} loading={isDeleting}>{t("Delete")}</Button>
                    </div>
                </DialogContent>
            </Dialog>

            <TeamDetailDialog
                teamId={detailTeamId}
                open={detailTeamId !== null}
                onOpenChange={(open) => { if (!open) setDetailTeamId(null); }}
            />
        </div>
    );
};

interface TeamCardStatProps {
    label: string;
    value: string | number;
    tone: "primary" | "success" | "error" | "muted";
}

const TeamCardStat = ({ label, value, tone }: TeamCardStatProps) => {
    const toneClass = {
        primary: "text-primary-medium",
        success: "text-success",
        error: "text-error",
        muted: "text-text-muted",
    }[tone];
    return (
        <div className="rounded-md bg-muted/40 px-2 py-1.5 text-center">
            <p className="text-[10px] uppercase tracking-wide text-text-muted">{label}</p>
            <p className={`text-sm font-bold ${toneClass}`}>{value}</p>
        </div>
    );
};
