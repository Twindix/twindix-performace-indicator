import type { TimeProjectInterface } from "@/interfaces/time";

export const TIME_STATUS_VARIANT: Record<
    TimeProjectInterface["status"],
    "default" | "success" | "warning" | "secondary"
> = {
    active: "success",
    planning: "warning",
    completed: "secondary",
    on_hold: "default",
};

export const TIME_STATUS_LABEL: Record<TimeProjectInterface["status"], string> = {
    active: "active",
    planning: "planning",
    completed: "completed",
    on_hold: "on hold",
};

export type TimeTabId = "projects" | "sprints" | "teams" | "members";

export const TIME_TABS: { id: TimeTabId; label: string }[] = [
    { id: "projects", label: "Projects" },
    { id: "sprints", label: "Sprints" },
    { id: "teams", label: "Teams" },
    { id: "members", label: "Members" },
];
