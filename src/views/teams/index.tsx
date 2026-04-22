import { useState } from "react";
import { Edit, MoreHorizontal, Plus, Trash2, Users } from "lucide-react";
import { toast } from "sonner";

import { Button, Card, CardContent, Input, Label, Textarea } from "@/atoms";
import { EmptyState, Header, QueryBoundary } from "@/components/shared";
import { TeamsSkeleton } from "@/components/skeletons";
import { t, useCreateTeam, useFormErrors, useGetTeams } from "@/hooks";
import type { TeamInterface } from "@/interfaces";
import {
    Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle,
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/ui";

export const TeamsView = () => {
    const { teams, isLoading, patchTeamLocal, refetch } = useGetTeams();
    const { setFieldErrors, clearError, clear: clearFieldErrors, getError } = useFormErrors();
    const { createHandler, isLoading: isSubmitting } = useCreateTeam({ onFieldErrors: setFieldErrors });
    const [addOpen, setAddOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<TeamInterface | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<TeamInterface | null>(null);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    const openEdit = (team: TeamInterface) => {
        setEditTarget(team);
        setName(team.name);
        setDescription("");
    };

    const handleSubmit = async () => {
        if (!name.trim()) return;
        if (editTarget) {
            patchTeamLocal({ ...editTarget, name: name.trim() });
            toast.success(t("Team updated (local only)"));
            closeDialog();
            return;
        }
        const res = await createHandler({ name: name.trim(), description: description.trim() || undefined });
        if (res) {
            patchTeamLocal(res);
            refetch();
            closeDialog();
        }
    };

    const handleDelete = () => {
        if (!deleteTarget) return;
        toast.success(t("Team removed (local only)"));
        setDeleteTarget(null);
    };

    const closeDialog = () => { setAddOpen(false); setEditTarget(null); setName(""); setDescription(""); clearFieldErrors(); };

    return (
        <div>
            <Header
                title={t("Teams")}
                description={t("Organize members into teams.")}
                actions={
                    <Button size="sm" className="gap-1.5" onClick={() => setAddOpen(true)}>
                        <Plus className="h-4 w-4" />
                        {t("Add Team")}
                    </Button>
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
                        <Card key={team.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-lighter text-primary-medium shrink-0">
                                        <Users className="h-5 w-5" />
                                    </div>
                                    <h3 className="text-base font-semibold text-text-dark truncate flex-1">{team.name}</h3>
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
                        {!editTarget && (
                            <div className="space-y-2">
                                <Label htmlFor="team-desc">{t("Description")}</Label>
                                <Textarea id="team-desc" rows={3} value={description} onChange={(e) => { setDescription(e.target.value); clearError("description"); }} placeholder={t("What does this team do?")} />
                                {getError("description") && <p className="text-xs text-error">{getError("description")}</p>}
                            </div>
                        )}
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
                            <Button variant="outline">{t("Cancel")}</Button>
                        </DialogClose>
                        <Button variant="destructive" onClick={handleDelete}>{t("Delete")}</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};
