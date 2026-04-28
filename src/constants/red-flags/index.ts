import type { RedFlagFormStateInterface, RedFlagSeverity } from "@/interfaces/red-flags";

export const RED_FLAG_SEVERITIES: readonly RedFlagSeverity[] = ["medium", "high", "critical"] as const;

export const redFlagsConstants = {
    severities: RED_FLAG_SEVERITIES,
    severityVariants: {
        critical: "error",
        high: "warning",
        medium: "secondary",
    } as Record<string, "error" | "warning" | "secondary" | "outline">,
    severityOptions: [
        { value: "medium" as RedFlagSeverity,   label: "Medium" },
        { value: "high" as RedFlagSeverity,     label: "High" },
        { value: "critical" as RedFlagSeverity, label: "Critical" },
    ],
    emptyForm: {
        title: "",
        description: "",
        severity: "medium",
    } as RedFlagFormStateInterface,
    errors: {
        fetchFailed: "Failed to load red flags.",
        countFailed: "Failed to load red flags count.",
        fetchDetailFailed: "Failed to load red flag details.",
        createFailed: "Failed to create red flag.",
        updateFailed: "Failed to update red flag.",
        deleteFailed: "Failed to delete red flag.",
    },
    messages: {
        createSuccess: "Red flag created successfully.",
        updateSuccess: "Red flag updated successfully.",
        deleteSuccess: "Red flag deleted successfully.",
    },
};
