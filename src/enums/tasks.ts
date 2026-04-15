export enum TaskPhase {
    Backlog = "backlog",
    Ready = "ready",
    InProgress = "in_progress",
    Review = "review",
    QA = "qa",
    Done = "done",
}

export enum TaskPriority {
    Critical = "critical",
    High = "high",
    Medium = "medium",
    Low = "low",
}

export enum TaskStatus {
    OnTrack = "on_track",
    AtRisk = "at_risk",
    Delayed = "delayed",
    OnHold = "on_hold",
}
