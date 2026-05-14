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
