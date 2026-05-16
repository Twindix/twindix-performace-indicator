// ===== New API types (V0.9) =====

export interface TimeSummaryInterface {
    total_hours: number;
    total_entries: number;
    active_members: number;
}

export interface TimeByProjectRowInterface {
    project_id: string;
    project_name: string;
    project_status: string;
    team_name: string;
    total_hours: number;
    progress: number;
    active_members: number;
}

export interface TimeBySprintRowInterface {
    sprint_id: string;
    sprint_name: string;
    sprint_status: string;
    project_name: string;
    start_date?: string | null;
    end_date?: string | null;
    total_hours: number;
    active_members: number;
}

export interface TimeByTeamRowInterface {
    team_id: string;
    team_name: string;
    department?: string | null;
    total_hours: number;
    active_members: number;
}

export interface TimeByMemberRowInterface {
    member_id: string;
    member_name: string;
    role?: string | null;
    avatar_initials?: string | null;
    total_hours: number;
    total_entries: number;
}

export interface TimeAggregationResponseInterface<T> {
    summary: TimeSummaryInterface;
    data: T[];
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

// ===== Legacy seed types (kept until consumers migrate) =====

export interface TimeMemberInterface {
    id: string;
    full_name: string;
    avatar_initials: string;
    role_label?: string;
    team_id?: string;
}

export interface TimeProjectInterface {
    id: string;
    name: string;
    team_name: string;
    team_id: string;
    status: "active" | "planning" | "completed" | "on_hold";
    progress: number;
}

export interface TimeSprintInterface {
    id: string;
    name: string;
    project_id: string;
    project_name: string;
    status: "active" | "planning" | "completed" | "on_hold";
    start_date: string;
    end_date: string;
}

export interface TimeTeamInterface {
    id: string;
    name: string;
    department: string;
}

export interface TimeTaskInterface {
    id: string;
    name: string;
    project_id: string;
    sprint_id?: string | null;
}

export interface TimeEntryInterface {
    id: string;
    date: string;
    member_id: string;
    project_id: string;
    sprint_id?: string | null;
    task_id?: string | null;
    hours: number;
    note?: string;
}

export interface TimeSeedInterface {
    projects: TimeProjectInterface[];
    sprints: TimeSprintInterface[];
    teams: TimeTeamInterface[];
    members: TimeMemberInterface[];
    tasks: TimeTaskInterface[];
    entries: TimeEntryInterface[];
}

export type TimeEntityKind = "project" | "sprint" | "team" | "member";

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
