import type { ProjectFormStateInterface, ProjectStatus, ProjectStatusBadgeVariant } from "@/interfaces";

export const projectsConstants = {
    errors: {
        fetchFailed: "Failed to load projects.",
        detailFetchFailed: "Failed to load project.",
        createFailed: "Failed to create project.",
        updateFailed: "Failed to update project.",
        deleteFailed: "Failed to delete project.",
        sprintsFetchFailed: "Failed to load project sprints.",
    },
    messages: {
        createSuccess: "Project created.",
        updateSuccess: "Project updated.",
        deleteSuccess: "Project deleted.",
    },
};

export const defaultProjectForm: ProjectFormStateInterface = {
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    status: "planning",
};

export const projectStatusVariants: Record<ProjectStatus, ProjectStatusBadgeVariant> = {
    active: "success",
    planning: "default",
    on_hold: "warning",
    completed: "secondary",
};

export const projectStatusLabels: Record<ProjectStatus, string> = {
    active: "Active",
    planning: "Planning",
    on_hold: "On Hold",
    completed: "Completed",
};

export const projectStatusOptions: ProjectStatus[] = ["planning", "active", "on_hold", "completed"];
