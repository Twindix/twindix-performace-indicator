import { DecisionCategory, DecisionStatus } from "@/enums";
import type { DecisionFormStateInterface } from "@/interfaces/decisions";

export const decisionsConstants = {
    statusVariants: {
        [DecisionStatus.Approved]: "success",
        [DecisionStatus.Pending]:  "warning",
        [DecisionStatus.Rejected]: "error",
        [DecisionStatus.Deferred]: "secondary",
    } as Record<DecisionStatus, "success" | "warning" | "error" | "secondary">,
    statusLabels: {
        [DecisionStatus.Approved]: "Approved",
        [DecisionStatus.Pending]:  "Pending",
        [DecisionStatus.Rejected]: "Rejected",
        [DecisionStatus.Deferred]: "Deferred",
    } as Record<DecisionStatus, string>,
    categoryLabels: {
        [DecisionCategory.Process]:     "Process",
        [DecisionCategory.Tooling]:     "Tooling",
        [DecisionCategory.Requirement]: "Requirement",
        [DecisionCategory.Design]:      "Design",
    } as Record<DecisionCategory, string>,
    createableCategories: [
        DecisionCategory.Process,
        DecisionCategory.Tooling,
        DecisionCategory.Design,
    ],
    emptyForm: {
        title: "",
        description: "",
        category: DecisionCategory.Process,
    } as DecisionFormStateInterface,
    errors: {
        fetchFailed: "Failed to load decisions.",
        fetchDetailFailed: "Failed to load decision details.",
        fetchAnalyticsFailed: "Failed to load decisions analytics.",
        createFailed: "Failed to create decision.",
        updateFailed: "Failed to update decision.",
        deleteFailed: "Failed to delete decision.",
    },
    messages: {
        createSuccess: "Decision created successfully.",
        updateSuccess: "Decision updated successfully.",
        deleteSuccess: "Decision deleted successfully.",
    },
};
