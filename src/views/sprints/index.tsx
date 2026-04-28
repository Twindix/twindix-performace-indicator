import { Plus, Target } from "lucide-react";

import { Button } from "@/atoms";
import { EmptyState, Header, QueryBoundary } from "@/components/shared";
import { SprintsSkeleton } from "@/components/skeletons";
import { t, useSprintsPage } from "@/hooks";

import { SprintsGrid } from "./components";
import { DeleteSprintDialog, SprintFormDialog } from "./dialogs";

export const SprintsView = () => {
    const {
        sprints,
        isLoading,
        permissions,
        form,
        formDialog,
        deleteDialog,
        onActivate,
    } = useSprintsPage();

    return (
        <div>
            <Header
                title={t("Sprints")}
                description={t("Manage sprints and activate the current one.")}
                actions={
                    permissions.canCreate ? (
                        <Button size="sm" className="gap-1.5" onClick={formDialog.onOpenAdd}>
                            <Plus className="h-4 w-4" />
                            {t("Add Sprint")}
                        </Button>
                    ) : null
                }
            />

            <QueryBoundary
                isLoading={isLoading}
                skeleton={<SprintsSkeleton />}
                empty={sprints.length === 0}
                emptyState={<EmptyState icon={Target} title={t("No sprints yet")} description={t("Create your first sprint to start planning work.")} />}
            >
                <SprintsGrid
                    sprints={sprints}
                    permissions={permissions}
                    onEdit={formDialog.onOpenEdit}
                    onDelete={deleteDialog.onOpen}
                    onActivate={onActivate}
                />
            </QueryBoundary>

            <SprintFormDialog
                isOpen={formDialog.isOpen}
                isEditMode={formDialog.isEditMode}
                form={form}
                isSubmitting={formDialog.isSubmitting}
                canSubmit={formDialog.canSubmit}
                onClose={formDialog.onClose}
                onSubmit={formDialog.onSubmit}
            />

            <DeleteSprintDialog
                target={deleteDialog.target}
                isDeleting={deleteDialog.isDeleting}
                onClose={deleteDialog.onClose}
                onConfirm={deleteDialog.onConfirm}
            />
        </div>
    );
};
