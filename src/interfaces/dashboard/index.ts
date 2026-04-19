export interface HealthScoreSubScoreInterface {
    score: number;
    label: string;
}

export interface HealthScoreInterface {
    overall: number;
    label: string;
    sub_scores?: Record<string, HealthScoreSubScoreInterface>;
    summary?: {
        total_tasks: number;
        active_blockers: number;
        completed_tasks: number;
    };
    active_blockers?: Array<{ id: string; title: string; severity: string; duration_days: number }>;
}

export interface DashboardMetricsInterface {
    on_time_delivery_rate?: number;
    task_rejection_rate?: number;
    urgent_alert_count?: number;
    stalled_red_flags?: number;
    total_red_flags?: number;
    total_comments?: number;
    responded_comments?: number;
    [key: string]: unknown;
}

export interface DashboardInterface {
    health_score: HealthScoreInterface;
    metrics: DashboardMetricsInterface;
    active_blockers?: unknown[];
    [key: string]: unknown;
}

export type DashboardResponseInterface = DashboardInterface;

export type HealthScoreResponseInterface = HealthScoreInterface;

export type DashboardMetricsResponseInterface = DashboardMetricsInterface;

export interface DashboardContextInterface {
    dashboard: DashboardInterface | null;
    healthScore: HealthScoreInterface | null;
    metrics: DashboardMetricsInterface | null;
    isLoading: boolean;
    refetch: () => Promise<void>;
    refetchHealthScore: () => Promise<void>;
    refetchMetrics: () => Promise<void>;
}
