import type { PaginatedResponseInterface } from "@/interfaces/common";

export interface SprintInterface {
    id: string;
    name: string;
    status: string | null;
    start_date: string;
    end_date: string;
    created_at: string;
    // Inline analytics from list response
    completion_rate?: number;
    on_time_rate?: number;
    open_blockers?: number;
    tasks_done?: number;
    tasks_total?: number;
    story_points_done?: number;
    story_points_total?: number;
    // Additional properties expected by the code
    startDate?: string;
    endDate?: string;
    goals?: string[];
    healthScore?: number;
}

export type SprintsListResponseInterface = PaginatedResponseInterface<SprintInterface>;

export interface SprintDetailResponseInterface {
    data: SprintInterface;
}

export interface SprintSummaryInterface {
    total_tasks: number;
    completed_tasks: number;
    total_story_points: number;
    total_estimated_hours: number;
    blocked_count: number;
}

export interface CreateSprintPayloadInterface {
    name: string;
    start_date: string;
    end_date: string;
}

export interface UpdateSprintPayloadInterface {
    name?: string;
    start_date?: string;
    end_date?: string;
}

export type {
    SprintAnalyticsResponseInterface,
    SprintAnalyticsSummaryInterface,
    SprintAnalyticsStatsInterface,
    SprintAnalyticsContributorInterface,
    SprintAnalyticsBurnChartInterface,
    SprintAnalyticsDailyThroughputPointInterface,
    SprintAnalyticsTaskStatusInterface,
} from "./analytics";
