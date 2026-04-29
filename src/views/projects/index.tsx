import { FolderKanban, Plus } from "lucide-react";

import { Button } from "@/atoms";
import { EmptyState, Header, QueryBoundary } from "@/components/shared";
import { ProjectsSkeleton } from "@/components/skeletons";
import { t, useProjectsPage } from "@/hooks";

import { OpenedProjectView, ProjectsGrid } from "@/components/projects";
import { DeleteProjectDialog, ProjectFormDialog } from "./dialogs";

export const ProjectsView = () => {
    const {
        projects,
        isLoading,
        permissions,
        openedProject,
        onEnterProject,
        onLeaveProject,
        form,
        formDialog,
        deleteDialog,
    } = useProjectsPage();

    if (openedProject) {
        return <OpenedProjectView project={openedProject} onBack={onLeaveProject} />;
    }

    return (
        <div>
            <Header
                title={t("Projects")}
                description={t("Group your sprints into projects.")}
                actions={
                    permissions.canCreate ? (
                        <Button size="sm" className="gap-1.5" onClick={formDialog.onOpenAdd}>
                            <Plus className="h-4 w-4" />
                            {t("Add Project")}
                        </Button>
                    ) : null
                }
            />

            <QueryBoundary
                isLoading={isLoading}
                skeleton={<ProjectsSkeleton />}
                empty={projects.length === 0}
                emptyState={<EmptyState icon={FolderKanban} title={t("No projects yet")} description={t("Create your first project to start organizing sprints.")} />}
            >
                <ProjectsGrid
                    projects={projects}
                    permissions={permissions}
                    onOpen={onEnterProject}
                    onEdit={formDialog.onOpenEdit}
                    onDelete={deleteDialog.onOpen}
                />
            </QueryBoundary>

            <ProjectFormDialog
                isOpen={formDialog.isOpen}
                isEditMode={formDialog.isEditMode}
                form={form}
                isSubmitting={formDialog.isSubmitting}
                onClose={formDialog.onClose}
                onSubmit={formDialog.onSubmit}
            />

            <DeleteProjectDialog
                target={deleteDialog.target}
                isDeleting={deleteDialog.isDeleting}
                onClose={deleteDialog.onClose}
                onConfirm={deleteDialog.onConfirm}
            />
        </div>
    );
};
