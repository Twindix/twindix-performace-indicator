export interface WorkloadUserInterface {
    id: string;
    name: string;
}

export interface WorkloadUserRowInterface {
    user: WorkloadUserInterface;
    total_tasks: number;
    completed_tasks: number;
    in_progress_tasks: number;
    blocked_tasks: number;
    total_story_points: number;
    completed_story_points: number;
    total_estimated_hours: number;
    logged_hours: number;
}

export interface WorkloadResponseInterface<T> {
    data: T[];
}
