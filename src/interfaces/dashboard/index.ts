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
