export interface SprintAnalyticsSummaryInterface {
    id: string;
    name: string;
    status: string;
}

export interface SprintAnalyticsStatsInterface {
    completion: number;
    on_time_rate: number;
    days_left: number;
    tasks_done: number;
    tasks_total: number;
    story_points_done: number;
    story_points_total: number;
    open_blockers: number;
    warning: string | null;
}

export interface SprintAnalyticsContributorInterface {
    user_id: string;
    name: string;
    avatar_initials?: string | null;
    tasks_count: number;
    hours_logged: number;
}

export interface SprintAnalyticsBurnChartInterface {
    planned: number[];
    actual: number[];
}

export interface SprintAnalyticsDailyThroughputPointInterface {
    day: string;
    tasks_completed: number;
}

export interface SprintAnalyticsTaskStatusInterface {
    in_progress?: number;
    review?: number;
    blocked?: number;
    done?: number;
    [key: string]: number | undefined;
}

export interface SprintAnalyticsResponseInterface {
    sprint: SprintAnalyticsSummaryInterface;
    stats: SprintAnalyticsStatsInterface;
    contributors: SprintAnalyticsContributorInterface[];
    burn_chart: SprintAnalyticsBurnChartInterface;
    daily_throughput: SprintAnalyticsDailyThroughputPointInterface[];
    task_status: SprintAnalyticsTaskStatusInterface;
}
