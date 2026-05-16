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
    health_score: number;
    on_time_rate: number;
    throughput_per_sprint: number;
    blocker_resolution_avg_hours: number;
    velocity: DeliveryVelocityPointInterface[];
    throughput: DeliveryThroughputPointInterface[];
    on_time: DeliveryOnTimePointInterface[];
    friction_sources: DeliveryFrictionSourceInterface[];
    blocker_trend: DeliveryBlockerTrendPointInterface[];
    leaderboard: DeliveryLeaderboardEntryInterface[];
}

export interface DeliveryAnalyticsFiltersInterface {
    from?: string;
    to?: string;
    project_id?: string;
}
