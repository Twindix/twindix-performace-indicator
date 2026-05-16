export interface MetricPointInterface {
    label: string;
    value: number;
}

export interface DualMetricPointInterface {
    label: string;
    planned: number;
    actual: number;
}

export interface BreakdownSliceInterface {
    name: string;
    value: number;
    color: string;
}

export interface MemberContributionInterface {
    name: string;
    initials: string;
    tasks_done: number;
    hours: number;
}

export interface ProjectAnalyticsInterface {
    completion_rate: number;
    sprints_total: number;
    sprints_active: number;
    tasks_done: number;
    tasks_total: number;
    open_blockers: number;
    on_time_rate: number;
    velocity_trend: MetricPointInterface[];
    burn_chart: DualMetricPointInterface[];
    status_breakdown: BreakdownSliceInterface[];
    blocker_breakdown: BreakdownSliceInterface[];
    contributors: MemberContributionInterface[];
}

export interface SprintAnalyticsInterface {
    completion_rate: number;
    tasks_done: number;
    tasks_total: number;
    story_points_done: number;
    story_points_total: number;
    days_left: number;
    open_blockers: number;
    on_time_rate: number;
    burn_chart: DualMetricPointInterface[];
    daily_throughput: MetricPointInterface[];
    status_breakdown: BreakdownSliceInterface[];
    contributors: MemberContributionInterface[];
}

export interface TeamAnalyticsInterface {
    members_active: number;
    projects_active: number;
    sprints_active: number;
    tasks_done: number;
    tasks_total: number;
    on_time_rate: number;
    velocity_trend: MetricPointInterface[];
    workload: MemberContributionInterface[];
    focus_breakdown: BreakdownSliceInterface[];
}

export interface AnalyticsSeedInterface {
    projects: Record<string, ProjectAnalyticsInterface>;
    sprints: Record<string, SprintAnalyticsInterface>;
    teams: Record<string, TeamAnalyticsInterface>;
    fallback: {
        project: ProjectAnalyticsInterface;
        sprint: SprintAnalyticsInterface;
        team: TeamAnalyticsInterface;
    };
}

export type {
    DeliveryAnalyticsResponseInterface,
    DeliveryAnalyticsFiltersInterface,
    DeliveryVelocityPointInterface,
    DeliveryThroughputPointInterface,
    DeliveryOnTimePointInterface,
    DeliveryFrictionSourceInterface,
    DeliveryBlockerTrendPointInterface,
    DeliveryLeaderboardEntryInterface,
} from "./delivery";
