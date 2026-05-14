import { GanttStatus } from "@/enums";

export const GANTT_STATUS_LABEL: Record<GanttStatus, string> = {
    [GanttStatus.NotStarted]: "Not Started",
    [GanttStatus.InProgress]: "In Progress",
    [GanttStatus.Completed]: "Completed",
    [GanttStatus.Delayed]: "Delayed",
};

export const GANTT_STATUS_BADGE_VARIANT: Record<
    GanttStatus,
    "default" | "success" | "warning" | "error" | "secondary"
> = {
    [GanttStatus.NotStarted]: "secondary",
    [GanttStatus.InProgress]: "default",
    [GanttStatus.Completed]: "success",
    [GanttStatus.Delayed]: "error",
};

export const GANTT_STATUS_BAR_CLASS: Record<GanttStatus, string> = {
    [GanttStatus.NotStarted]: "bg-muted",
    [GanttStatus.InProgress]: "bg-primary-lighter",
    [GanttStatus.Completed]: "bg-success-light",
    [GanttStatus.Delayed]: "bg-error-light",
};

export const GANTT_STATUS_FILL_CLASS: Record<GanttStatus, string> = {
    [GanttStatus.NotStarted]: "bg-muted-foreground/40",
    [GanttStatus.InProgress]: "bg-primary-medium",
    [GanttStatus.Completed]: "bg-success",
    [GanttStatus.Delayed]: "bg-error",
};
