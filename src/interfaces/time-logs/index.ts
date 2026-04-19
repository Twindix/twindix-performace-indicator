export interface TimeLogInterface {
    id: string;
    task_id: string;
    user_id: string;
    hours: number;
    date: string;
    description?: string;
    created_at?: string;
    updated_at?: string;
}

export interface TimeLogsListResponseInterface {
    data: TimeLogInterface[];
    isSuccess: boolean;
}

export interface TimeLogDetailResponseInterface {
    data: TimeLogInterface;
    isSuccess: boolean;
}

export interface TimeLogsSummaryInterface {
    total_hours: number;
    total_entries: number;
    by_user?: Record<string, number>;
    by_task?: Record<string, number>;
}

export interface TimeLogsSummaryResponseInterface {
    data: TimeLogsSummaryInterface;
    isSuccess: boolean;
}

export interface CreateTimeLogPayloadInterface {
    hours: number;
    date: string;
    description?: string;
}

export interface UpdateTimeLogPayloadInterface {
    hours?: number;
    date?: string;
    description?: string;
}
