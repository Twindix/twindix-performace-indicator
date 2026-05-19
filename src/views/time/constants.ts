export type TimeTabId = "sprint" | "user" | "task";

export const TIME_TABS: { id: TimeTabId; label: string }[] = [
    { id: "sprint", label: "Sprint" },
    { id: "user", label: "User" },
    { id: "task", label: "Task" },
];
