import { AlertTriangle, GitBranch, Layers, MessageSquare, PenTool, Shield } from "lucide-react";

import { BlockerType } from "@/enums";

export const blockersConstants = {
    defaults: {
        emptyForm: {
            title: "",
            description: "",
            severity: "medium",
            type: BlockerType.Technical as string,
            ownedBy: "",
        },
        filters: { status: "all", type: "all", severity: "all", owner: "all", reporter: "all" },
    },
    typeConfig: {
        [BlockerType.Requirements]: { labelKey: "Requirements", icon: AlertTriangle, color: "bg-friction-requirements text-friction-requirements" },
        [BlockerType.ApiDependency]: { labelKey: "API Dependency", icon: GitBranch, color: "bg-friction-dependencies text-friction-dependencies" },
        [BlockerType.Design]: { labelKey: "Design", icon: PenTool, color: "bg-primary-lighter text-primary-medium" },
        [BlockerType.QAHandoff]: { labelKey: "QA Handoff", icon: Layers, color: "bg-friction-process text-friction-process" },
        [BlockerType.Communication]: { labelKey: "Communication", icon: MessageSquare, color: "bg-friction-communication text-friction-communication" },
        [BlockerType.Technical]: { labelKey: "Technical", icon: Shield, color: "bg-friction-team text-friction-team" },
    } as Record<string, { labelKey: string; icon: typeof AlertTriangle; color: string }>,
    typeOptions: [
        { value: BlockerType.Requirements, label: "Requirements" },
        { value: BlockerType.ApiDependency, label: "API Dependency" },
        { value: BlockerType.Design, label: "Design" },
        { value: BlockerType.QAHandoff, label: "QA Handoff" },
        { value: BlockerType.Communication, label: "Communication" },
        { value: BlockerType.Technical, label: "Technical" },
    ],
    severityOptions: [
        { value: "critical", label: "Critical" },
        { value: "high", label: "High" },
        { value: "medium", label: "Medium" },
        { value: "low", label: "Low" },
    ],
    severityVariants: {
        critical: "error",
        high: "warning",
        medium: "secondary",
        low: "outline",
    } as Record<string, "error" | "warning" | "secondary" | "outline">,
    statusOptions: [
        { value: "all", label: "All Statuses" },
        { value: "active", label: "Active" },
        { value: "resolved", label: "Resolved" },
        { value: "escalated", label: "Escalated" },
    ],
    statusVariants: {
        resolved: "success",
        escalated: "warning",
        active: "error",
    } as Record<string, "error" | "success" | "warning" | "secondary">,
    fallbackTypeInfo: { labelKey: "", icon: AlertTriangle, color: "bg-muted text-text-muted" },
    deleteConfirmMessage: "Delete this blocker? This cannot be undone.",
    errors: {
        fetchFailed: "Failed to load blockers.",
        analyticsFailed: "Failed to load blockers analytics.",
        fetchDetailFailed: "Failed to load blocker details.",
        createFailed: "Failed to create blocker.",
        updateFailed: "Failed to update blocker.",
        resolveFailed: "Failed to resolve blocker.",
        escalateFailed: "Failed to escalate blocker.",
        linkTasksFailed: "Failed to link tasks.",
        unlinkTaskFailed: "Failed to unlink task.",
        deleteFailed: "Failed to delete blocker.",
        genericError: "Something went wrong.",
    },
    messages: {
        createSuccess: "Blocker created successfully.",
        updateSuccess: "Blocker updated successfully.",
        deleteSuccess: "Blocker deleted successfully.",
        resolveSuccess: "Blocker marked as resolved.",
        escalateSuccess: "Blocker escalated.",
        linkTasksSuccess: "Tasks linked successfully.",
        unlinkTaskSuccess: "Task unlinked.",
    },
};
