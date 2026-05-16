export interface WorkloadByProjectRowInterface {
    project_id: string;
    project_name: string;
    project_status: string;
    team_name: string;
    member_count: number;
    avg_utilization: number;
    overloaded_count: number;
    context_switches: number;
    points_completed: number;
    points_total: number;
    progress: number;
}

export interface WorkloadBySprintRowInterface {
    sprint_id: string;
    sprint_name: string;
    sprint_status: string;
    project_name: string;
    member_count: number;
    avg_utilization: number;
    overloaded_count: number;
    context_switches: number;
    points_completed: number;
    points_total: number;
    progress: number;
    start_date?: string | null;
    end_date?: string | null;
}

export interface WorkloadByTeamRowInterface {
    team_id: string;
    team_name: string;
    department?: string | null;
    member_count: number;
    avg_utilization: number;
    overloaded_count: number;
    context_switches: number;
    points_completed: number;
    points_total: number;
}

export interface WorkloadByMemberRowInterface {
    member_id: string;
    member_name: string;
    avatar_initials?: string | null;
    role?: string | null;
    team_name?: string | null;
    sprint_id?: string | null;
    sprint_name?: string | null;
    capacity: number;
    assigned: number;
    completed: number;
    utilization: number;
    context_switches: number;
    active_tasks: number;
    overloaded: boolean;
}

export interface WorkloadResponseInterface<T> {
    data: T[];
}

export interface WorkloadMemberFiltersInterface {
    sprint_id?: string;
}
