export interface ProjectAnalyticsSummaryInterface {
    id: string;
    name: string;
    status: string;
}

export interface ProjectAnalyticsStatsInterface {
    completion: number;
    on_time_rate: number;
    active_sprints: number;
    open_blockers: number;
    tasks_done: number;
    tasks_total: number;
    start_date: string | null;
    end_date: string | null;
    sprints_count: number;
}

export interface ProjectAnalyticsContributorInterface {
    user_id: string;
    name: string;
    avatar_initials?: string | null;
    tasks_count: number;
    hours_logged: number;
}

export interface ProjectAnalyticsVelocityPointInterface {
    sprint: string;
    points: number;
}

export interface ProjectAnalyticsBurnChartInterface {
    planned: number[];
    actual: number[];
}

export interface ProjectAnalyticsTaskStatusInterface {
    backlog?: number;
    in_progress?: number;
    review?: number;
    blocked?: number;
    done?: number;
    [key: string]: number | undefined;
}

export interface ProjectAnalyticsBlockerSourcesInterface {
    [category: string]: number;
}

export interface ProjectAnalyticsResponseInterface {
    project: ProjectAnalyticsSummaryInterface;
    stats: ProjectAnalyticsStatsInterface;
    contributors: ProjectAnalyticsContributorInterface[];
    velocity: ProjectAnalyticsVelocityPointInterface[];
    burn_chart: ProjectAnalyticsBurnChartInterface;
    task_status: ProjectAnalyticsTaskStatusInterface;
    blocker_sources: ProjectAnalyticsBlockerSourcesInterface;
}
