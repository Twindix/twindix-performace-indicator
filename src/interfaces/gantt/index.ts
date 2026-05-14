import type { GanttStatus } from "@/enums";

export interface GanttProjectLiteInterface {
    id: string;
    name: string;
}

export interface GanttAssigneeInterface {
    id: string;
    full_name: string;
    avatar_initials: string;
}

export interface GanttTaskInterface {
    id: string;
    name: string;
    project_id: string;
    project_name: string;
    start_date: string;
    end_date: string;
    status: GanttStatus;
    progress: number;
    assignee?: GanttAssigneeInterface | null;
}

export interface GanttFiltersInterface {
    projectId: string;
    status: GanttStatus | "all";
    rangeStart: string;
    rangeEnd: string;
}

export interface GanttSeedInterface {
    projects: GanttProjectLiteInterface[];
    tasks: GanttTaskInterface[];
}
