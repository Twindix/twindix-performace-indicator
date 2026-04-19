export interface HealthScoreInterface {
    overall_score: number;
    sub_scores?: Record<string, number>;
}

export interface DashboardMetricsInterface {
    total_tasks?: number;
    completed_tasks?: number;
    blocked_tasks?: number;
    active_blockers?: number;
    velocity?: number;
    cycle_time?: number;
    [key: string]: unknown;
}

export interface DashboardInterface {
    health_score: HealthScoreInterface;
    metrics: DashboardMetricsInterface;
    active_blockers?: unknown[];
    [key: string]: unknown;
}

export interface DashboardResponseInterface {
    data: DashboardInterface;
    isSuccess: boolean;
}

export interface HealthScoreResponseInterface {
    data: HealthScoreInterface;
    isSuccess: boolean;
}

export interface DashboardMetricsResponseInterface {
    data: DashboardMetricsInterface;
    isSuccess: boolean;
}

export interface DashboardContextInterface {
    dashboard: DashboardInterface | null;
    healthScore: HealthScoreInterface | null;
    metrics: DashboardMetricsInterface | null;
    isLoading: boolean;
    refetch: () => Promise<void>;
    refetchHealthScore: () => Promise<void>;
    refetchMetrics: () => Promise<void>;
}
