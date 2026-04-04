export enum BlockerType {
    Requirements = "requirements",
    ApiDependency = "api_dependency",
    Design = "design",
    QAHandoff = "qa_handoff",
    Communication = "communication",
    Technical = "technical",
}

export enum BlockerStatus {
    Active = "active",
    Resolved = "resolved",
    Escalated = "escalated",
}

export enum BlockerImpact {
    Critical = "critical",
    High = "high",
    Medium = "medium",
    Low = "low",
}
