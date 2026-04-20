export interface SprintInterface {
    id: string;
    name: string;
    status: string | null;
    start_date: string;
    end_date: string;
    created_at: string;
}

export interface SprintMetaInterface {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export interface SprintsListResponseInterface {
    data: SprintInterface[];
    meta: SprintMetaInterface;
}

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
