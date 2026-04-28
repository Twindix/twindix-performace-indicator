import type { SprintBadgeInterface, SprintFormStateInterface } from "@/interfaces";

export const sprintsConstants = {
    errors: {
        fetchFailed: "Failed to load sprints.",
        fetchDetailFailed: "Failed to load sprint details.",
        createFailed: "Failed to create sprint.",
        updateFailed: "Failed to update sprint.",
        deleteFailed: "Failed to delete sprint.",
        activateFailed: "Failed to activate sprint.",
        summaryFailed: "Failed to load sprint summary.",
    },
    messages: {
        createSuccess: "Sprint created successfully.",
        updateSuccess: "Sprint updated successfully.",
        deleteSuccess: "Sprint deleted successfully.",
        activateSuccess: "Sprint activated successfully.",
    },
};

export const defaultSprintForm: SprintFormStateInterface = {
    name: "",
    start_date: "",
    end_date: "",
};

export const sprintBadgeByStatus: Record<string, SprintBadgeInterface> = {
    active:    { label: "Active",    variant: "success" },
    completed: { label: "Completed", variant: "outline" },
};

export const defaultSprintBadge: SprintBadgeInterface = { label: "Planned", variant: "secondary" };
