import { useState } from "react";
import { Plus, Users } from "lucide-react";

import { Button, Card, CardContent, Input, Label, Textarea } from "@/atoms";
import { EmptyState, Header } from "@/components/shared";
import { t, useCreateTeam, useGetTeams } from "@/hooks";
import {
    Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle,
} from "@/ui";

export const TeamsView = () => {
    const { teams, isLoading, patchTeamLocal } = useGetTeams();
    const { createHandler, isLoading: isSubmitting } = useCreateTeam();
    const [addOpen, setAddOpen] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    const handleSubmit = async () => {
        if (!name.trim()) return;
        const res = await createHandler({ name: name.trim(), description: description.trim() || undefined });
        if (res) {
            patchTeamLocal(res);
            setAddOpen(false);
            setName("");
            setDescription("");
        }
    };

    const closeDialog = () => { setAddOpen(false); setName(""); setDescription(""); };

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

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />
                    ))}
                </div>
            ) : teams.length === 0 ? (
                <EmptyState
                    icon={Users}
                    title={t("No teams yet")}
                    description={t("Create your first team to group members.")}
                />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {teams.map((team) => (
                        <Card key={team.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-lighter text-primary-medium shrink-0">
                                        <Users className="h-5 w-5" />
                                    </div>
                                    <h3 className="text-base font-semibold text-text-dark truncate">{team.name}</h3>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <Dialog open={addOpen} onOpenChange={(open) => !open && closeDialog()}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{t("Add Team")}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 mt-2">
                        <div className="space-y-2">
                            <Label htmlFor="team-name">{t("Name")} <span className="text-error">*</span></Label>
                            <Input id="team-name" value={name} onChange={(e) => setName(e.target.value)} placeholder={t("Frontend")} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="team-desc">{t("Description")}</Label>
                            <Textarea id="team-desc" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t("What does this team do?")} />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                        <DialogClose asChild>
                            <Button variant="outline" disabled={isSubmitting}>{t("Cancel")}</Button>
                        </DialogClose>
                        <Button onClick={handleSubmit} disabled={isSubmitting || !name.trim()}>
                            {isSubmitting ? t("Creating...") : t("Create Team")}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};
