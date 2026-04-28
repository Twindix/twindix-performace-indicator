import type { BlockerSeverityBadgeInterface, DashboardBadgeVariant } from "@/interfaces";

const variantBySeverity: Record<string, DashboardBadgeVariant> = {
    critical: "error",
    high: "warning",
};

export const getBlockerSeverityBadge = (severity: string): BlockerSeverityBadgeInterface => ({
    variant: variantBySeverity[severity] ?? "secondary",
    label: severity.charAt(0).toUpperCase() + severity.slice(1),
});
