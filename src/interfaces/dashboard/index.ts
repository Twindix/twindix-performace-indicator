import type { LucideIcon } from "lucide-react";

export interface DashboardSubScoreInterface {
    score: number;
    label: string;
}

export interface DashboardActiveBlockerInterface {
    id: string;
    title: string;
    severity: string;
    duration_days: number;
}

export interface DashboardSummaryInterface {
    total_tasks: number;
    active_blockers: number;
    completed_tasks: number;
}

export interface HealthScoreInterface {
    overall: number;
    label: string;
    sub_scores: Record<string, DashboardSubScoreInterface>;
    summary: DashboardSummaryInterface;
    active_blockers: DashboardActiveBlockerInterface[];
}

export interface DashboardMetricsInterface {
    on_time_delivery_rate: number;
    task_rejection_rate: number;
    urgent_alert_count: number;
    stalled_red_flags: number;
    total_red_flags: number;
    total_comments: number;
    responded_comments: number;
}

export interface DashboardInterface {
    health_score: HealthScoreInterface;
    metrics: DashboardMetricsInterface;
}

export interface FrictionAreaConfigInterface {
    key: string;
    labelKey: string;
    icon: LucideIcon;
    textColor: string;
}

export interface MetricTileConfigInterface {
    labelKey: string;
    field: keyof DashboardMetricsInterface;
    suffix?: string;
}

export type DashboardBadgeVariant = "error" | "warning" | "secondary";

export interface BlockerSeverityBadgeInterface {
    variant: DashboardBadgeVariant;
    label: string;
}

export interface AnimNumPropsInterface {
    value: number;
    className?: string;
}

export interface MetricBoxPropsInterface {
    label: string;
    value: number;
    suffix?: string;
}

export interface HealthScoreCardPropsInterface {
    overallScore: number;
    summary?: DashboardSummaryInterface;
}

export interface HealthScoreSummaryPropsInterface {
    summary?: DashboardSummaryInterface;
}

export interface FrictionAreasGridPropsInterface {
    subScores: Record<string, DashboardSubScoreInterface>;
    compact: boolean;
}

export interface FrictionAreaCardPropsInterface {
    config: FrictionAreaConfigInterface;
    score: number;
    compact: boolean;
}

export interface MetricsSectionPropsInterface {
    metrics: DashboardMetricsInterface;
    compact: boolean;
}

export interface ActiveBlockersCardPropsInterface {
    blockers: DashboardActiveBlockerInterface[];
}

export interface ActiveBlockerItemPropsInterface {
    blocker: DashboardActiveBlockerInterface;
}
