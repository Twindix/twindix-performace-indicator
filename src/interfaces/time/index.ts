export interface TimeByUserInterface {
    user_id: string;
    name: string;
    total_logged_hours: number;
}

export interface TimeByDayInterface {
    date: string;
    logged_hours: number;
}

export interface SprintTimeTrackingResponseInterface {
    sprint_id: string;
    total_estimated_hours: number;
    total_logged_hours: number;
    variance_hours: number;
    by_user: TimeByUserInterface[];
}

export interface UserTimeTrackingResponseInterface {
    user_id: string;
    total_logged_hours: number;
    by_day: TimeByDayInterface[];
}

export interface TaskTimeTrackingResponseInterface {
    task_id: string;
    total_logged_hours: number;
    by_user: TimeByUserInterface[];
}

export interface CreateStandaloneTimeLogPayloadInterface {
    date: string;
    hours: number;
    user_id: string;
    project_id: string;
    sprint_id?: string;
    task_id?: string;
    note?: string;
}

export interface TimeLogEntryRow {
    id: string;
    date: string;
    member_name: string;
    task_name: string;
    hours: number;
    note?: string;
}

export interface CreateTimeEntryPayloadInterface {
    date: string;
    member_id: string;
    project_id: string;
    sprint_id?: string | null;
    task_id?: string | null;
    hours: number;
    note?: string;
}
