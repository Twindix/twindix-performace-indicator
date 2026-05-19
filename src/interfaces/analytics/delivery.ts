export interface DeliveryVelocityPointInterface {
    month: string;
    value: number;
}

export interface DeliveryThroughputPointInterface {
    month: string;
    value: number;
}

export interface DeliveryOnTimePointInterface {
    month: string;
    value: number;
}

export interface DeliveryFrictionSourceInterface {
    category: string;
    count: number;
}

export interface DeliveryBlockerTrendPointInterface {
    month: string;
    actual: number;
    target: number;
}

export interface DeliveryLeaderboardEntryInterface {
    project_id: string;
    project_name: string;
    score: number;
    velocity: number;
    completion: number;
}

export interface DeliveryAnalyticsResponseInterface {
    sprint_id: string;
    sprint_name: string;
    blocked_tasks: number;
    completed_story_points: number;
    completed_tasks: number;
    completion_rate: number;
    overdue_tasks: number;
    story_point_completion_rate: number;
    total_story_points: number;
    total_tasks: number;
    by_priority: Record<string, { total: number; completed: number } | number>;
    by_status: Record<string, { total: number; completed: number } | number>;
}

export interface DeliveryAnalyticsFiltersInterface {
    from?: string;
    to?: string;
    project_id?: string;
}
