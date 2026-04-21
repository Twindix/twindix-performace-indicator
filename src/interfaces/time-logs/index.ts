export interface TimeLogInterface {
    id: string;
    task_id: string;
    user_id: string;
    hours: number;
    description?: string;
    logged_at: string;
    created_at: string;
}

export interface CreateTimeLogPayloadInterface {
    hours: number;
    description?: string;
    logged_at?: string;
}

export interface UpdateTimeLogPayloadInterface {
    hours?: number;
    description?: string;
    logged_at?: string;
}

export interface TimeLogsSummaryInterface {
    total_hours: number;
    by_user: Array<{ user_id: string; full_name: string; hours: number }>;
    by_task: Array<{ task_id: string; title: string; hours: number }>;
}
