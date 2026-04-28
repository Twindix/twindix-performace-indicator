export const alertsConstants = {
    defaults: {
        emptyForm: { title: "", body: "", mentioned_user_ids: [] as string[] },
    },
    filters: {
        typeChips: [
            { value: "", label: "All" },
            { value: "manual", label: "Manual" },
            { value: "auto_alarm", label: "Deadline" },
            { value: "dependency_resolved", label: "Dependency" },
            { value: "task_completion_review", label: "Review" },
            { value: "requirements_approved", label: "Approved" },
        ],
    },
    targets: {
        all: "all",
        specific: "specific_users",
    },
    statuses: {
        done: "done",
    },
    titles: {
        taskCompletionReviewRequired: "Task Completion Review Required",
    },
    errors: {
        fetchFailed: "Failed to load alerts.",
        countFailed: "Failed to load alerts count.",
        fetchDetailFailed: "Failed to load alert details.",
        createFailed: "Failed to create alert.",
        updateFailed: "Failed to update alert.",
        deleteFailed: "Failed to delete alert.",
        acknowledgeFailed: "Failed to acknowledge alert.",
        doneFailed: "Failed to mark alert as done.",
    },
    messages: {
        createSuccess: "Alert created successfully.",
        updateSuccess: "Alert updated successfully.",
        deleteSuccess: "Alert deleted successfully.",
        acknowledgeSuccess: "Alert acknowledged.",
        doneSuccess: "Alert marked as done.",
    },
};
