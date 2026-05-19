import type { GanttStatus } from "@/enums";

export interface GanttTaskInterface {
    id: string;
    code: string;
    title: string;
    status: GanttStatus;
    priority: string;
    start_date: string | null;
    due_date: string | null;
    progress: number;
    assignee: string | null;
    dependencies: string[];
    is_blocked: boolean;
    estimated_hours: number | null;
}

export interface GanttSprintInterface {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
}

export interface GanttResponseInterface {
    sprint: GanttSprintInterface;
    tasks: GanttTaskInterface[];
}

export interface GanttApiFiltersInterface {
    status?: GanttStatus;
}

export interface GanttFiltersInterface {
    status: GanttStatus | "all";
    mode: "sprint" | "project";
    entityId: string;
}
