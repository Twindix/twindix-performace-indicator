import { TrendingDown, TrendingUp, Minus } from "lucide-react";

import { Card, CardContent } from "@/atoms";
import { MetricStatus, MetricTrend } from "@/enums";
import { cn } from "@/utils";

interface MetricCardProps {
    name: string;
    value: number;
    unit: string;
    status: MetricStatus;
    trend: MetricTrend;
    trendPercent: number;
    description?: string;
    compact?: boolean;
}

const statusColors: Record<MetricStatus, string> = {
    [MetricStatus.Healthy]: "text-success",
    [MetricStatus.Warning]: "text-warning",
    [MetricStatus.Critical]: "text-error",
};

const statusBgColors: Record<MetricStatus, string> = {
    [MetricStatus.Healthy]: "bg-success-light",
    [MetricStatus.Warning]: "bg-warning-light",
    [MetricStatus.Critical]: "bg-error-light",
};

const trendIcons: Record<MetricTrend, typeof TrendingUp> = {
    [MetricTrend.Up]: TrendingUp,
    [MetricTrend.Down]: TrendingDown,
    [MetricTrend.Stable]: Minus,
};

export const MetricCard = ({ name, value, unit, status, trend, trendPercent, description, compact }: MetricCardProps) => {
    const TrendIcon = trendIcons[trend];
    const isPositiveTrend = (trend === MetricTrend.Down && name !== "Workload Balance" && name !== "Task Readiness Rate" && name !== "Story Quality Score" && name !== "Handoff Completion Rate" && name !== "Decision Log Coverage") ||
        (trend === MetricTrend.Up && (name === "Task Readiness Rate" || name === "Story Quality Score" || name === "Handoff Completion Rate" || name === "Decision Log Coverage" || name === "Workload Balance"));
    const trendColor = trend === MetricTrend.Stable ? "text-text-muted" : isPositiveTrend ? "text-success" : "text-error";

    if (compact) {
        return (
            <div className={cn("flex items-center gap-3 rounded-[var(--radius-default)] p-3", statusBgColors[status])}>
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-text-secondary truncate">{name}</p>
                    <p className={cn("text-lg font-bold", statusColors[status])}>{value}{unit === "%" || unit === "/day" ? unit : ` ${unit}`}</p>
                </div>
                <div className={cn("flex items-center gap-1 text-xs font-medium", trendColor)}>
                    <TrendIcon className="h-3 w-3" />
                    <span>{Math.abs(trendPercent)}%</span>
                </div>
            </div>
        );
    }

    return (
        <Card className="overflow-hidden">
            <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                    <p className="text-xs font-medium text-text-secondary">{name}</p>
                    <div className={cn("flex items-center gap-1 text-xs font-medium", trendColor)}>
                        <TrendIcon className="h-3 w-3" />
                        <span>{Math.abs(trendPercent)}%</span>
                    </div>
                </div>
                <p className={cn("text-2xl font-bold mb-1", statusColors[status])}>
                    {value}{unit === "%" || unit === "/day" ? unit : ` ${unit}`}
                </p>
                {description && <p className="text-xs text-text-muted line-clamp-2">{description}</p>}
            </CardContent>
        </Card>
    );
};
