import { useState } from "react";
import { Edit, MoreHorizontal, Plus, Trash2, Users } from "lucide-react";

import { Button, Card, CardContent, Input, Label, Textarea } from "@/atoms";
import { EmptyState, Header, QueryBoundary } from "@/components/shared";
import { TeamsSkeleton } from "@/components/skeletons";
import { t, useCreateTeam, useDeleteTeam, useFormErrors, useGetTeams, usePermissions, useUpdateTeam } from "@/hooks";
import type { TeamInterface } from "@/interfaces";
import {
    Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle,
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/ui";
import { TeamDetailDialog } from "./TeamDetailDialog";

export const TeamsView = () => {
    const p = usePermissions();
    const { teams, isLoading, patchTeamLocal, removeTeamLocal } = useGetTeams();
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

    return (
        <div>
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
                isLoading={isLoading}
                skeleton={<TeamsSkeleton />}
                empty={teams.length === 0}
                emptyState={<EmptyState icon={Users} title={t("No teams yet")} description={t("Create your first team to group members.")} />}
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {teams.filter((team) => team.id !== deleteTarget?.id).map((team) => (
                        <Card key={team.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setDetailTeamId(team.id)}>
                            <CardContent className="p-5">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-lighter text-primary-medium shrink-0">
                                        <Users className="h-5 w-5" />
                                    </div>
                                    <h3 className="text-base font-semibold text-text-dark truncate flex-1">{team.name}</h3>
                                    {p.teams.manage() && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={(e) => e.stopPropagation()}>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEdit(team); }} className="gap-2 cursor-pointer">
                                                    <Edit className="h-4 w-4" /> {t("Edit")}
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setDeleteTarget(team); }} className="gap-2 text-error focus:text-error cursor-pointer">
                                                    <Trash2 className="h-4 w-4" /> {t("Delete")}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
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
