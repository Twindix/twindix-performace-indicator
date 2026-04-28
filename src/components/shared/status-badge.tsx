import { Badge } from "@/atoms";
import { MetricStatus } from "@/enums";
import { t } from "@/utils";

interface StatusBadgeProps {
    status: MetricStatus;
    label?: string;
}

const statusVariants: Record<MetricStatus, "success" | "warning" | "error"> = {
    [MetricStatus.Healthy]: "success",
    [MetricStatus.Warning]: "warning",
    [MetricStatus.Critical]: "error",
};

const statusLabels: Record<MetricStatus, string> = {
    [MetricStatus.Healthy]: "Healthy",
    [MetricStatus.Warning]: "Needs Attention",
    [MetricStatus.Critical]: "Critical",
};

export const StatusBadge = ({ status, label }: StatusBadgeProps) => (
    <Badge variant={statusVariants[status]}>{label ?? t(statusLabels[status])}</Badge>
);
