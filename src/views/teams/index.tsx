import { Plus } from "lucide-react";

import { Button } from "@/atoms";
import { Header } from "@/components/shared";
import { t, useTeamsView } from "@/hooks";

import { TeamsGrid } from "./components";
import { DeleteTeamDialog, TeamDetailDialog, TeamFormDialog } from "./dialogs";

export const TeamsView = () => {
    const v = useTeamsView();

    return (
        <div>
            <Header
                title={t("Teams")}
                description={t("Organize members into teams.")}
                actions={
                    v.canCreate ? (
                        <Button size="sm" className="gap-1.5" onClick={v.onAddOpen}>
                            <Plus className="h-4 w-4" />
                            {t("Add Team")}
                        </Button>
                    ) : null
                }
            />

            <TeamsGrid
                teams={v.teams}
                isLoading={v.isLoading}
                deleteTargetId={v.deleteTarget?.id ?? null}
                canManage={v.canManage}
                onCardClick={v.onCardClick}
                onEdit={v.onEdit}
                onDelete={v.onDelete}
            />

            <TeamFormDialog
                open={v.addOpen}
                editTarget={v.editTarget}
                fields={v.formFields}
                handlers={v.formHandlers}
                isSubmitting={v.isSubmitting}
            />

            <DeleteTeamDialog
                open={v.deleteTarget !== null}
                teamName={v.deleteTarget?.name}
                isDeleting={v.isDeleting}
                onConfirm={v.onDeleteConfirm}
                onClose={v.onDeleteClose}
            />

            <TeamDetailDialog
                teamId={v.detailTeamId}
                open={v.detailTeamId !== null}
                onOpenChange={(open: boolean) => { if (!open) v.onDetailClose(); }}
            />
        </div>
    );
};
