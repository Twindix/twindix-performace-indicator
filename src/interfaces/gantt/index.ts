import type { GanttStatus } from "@/enums";

export interface GanttTaskInterface {
    id: string;
    title: string;
    project_name: string;
    status: GanttStatus;
    assignee_name: string | null;
    start_date: string;
    end_date: string;
    progress: number;
    is_delayed: boolean;
}

export interface GanttSummaryInterface {
    total_tasks: number;
    in_progress: number;
    completed: number;
    delayed: number;
}

export interface GanttResponseInterface {
    summary: GanttSummaryInterface;
    tasks: GanttTaskInterface[];
}

export interface GanttApiFiltersInterface {
    project_id?: string;
    status?: GanttStatus;
    from?: string;
    to?: string;
}

export interface GanttFiltersInterface {
    projectId: string;
    status: GanttStatus | "all";
    rangeStart: string;
    rangeEnd: string;
}
