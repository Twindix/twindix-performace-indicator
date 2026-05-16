export interface ReportProjectSummaryInterface {
    id: string;
    name: string;
    status: string;
}

export interface ReportTeamSummaryInterface {
    name: string;
}

export interface ReportOverviewSectionInterface {
    sprints_count: number;
    tasks_done: number;
    tasks_total: number;
    on_time_rate: number;
    team_name: string;
    needs_attention: string[];
}

export interface ReportDeliverySectionInterface {
    completion: number;
    tasks_done: number;
    tasks_total: number;
    on_time_rate: number;
    open_blockers: number;
}

export interface ReportWorkloadSectionInterface {
    team_size: number;
    avg_utilization: number;
    overloaded: number;
    points_completed: number;
    points_total: number;
}

export interface ReportHandoffSectionInterface {
    total_handoffs: number;
    avg_completion: number;
    fully_completed: number;
    below_threshold: number;
}

export interface ReportAuthorshipContributorInterface {
    user_id?: string;
    name: string;
    features: number;
    tasks: number;
    total: number;
}

export interface ReportAuthorshipSectionInterface {
    total_items: number;
    features: number;
    tasks: number;
    contributors: ReportAuthorshipContributorInterface[];
}

export interface ReportFrictionCategoryInterface {
    category: string;
    count: number;
}

export interface ReportFrictionSectionInterface {
    categories: ReportFrictionCategoryInterface[];
    avg_resolution_hours: number;
}

export type ReportRecommendationsSectionInterface = string[];

export interface ProjectReportResponseInterface {
    project: ReportProjectSummaryInterface;
    team: ReportTeamSummaryInterface;
    overview: ReportOverviewSectionInterface;
    delivery: ReportDeliverySectionInterface;
    workload: ReportWorkloadSectionInterface;
    handoff: ReportHandoffSectionInterface;
    authorship: ReportAuthorshipSectionInterface;
    friction: ReportFrictionSectionInterface;
    recommendations: ReportRecommendationsSectionInterface;
}

export type ReportSectionKey = "overview" | "delivery" | "workload" | "handoff" | "authorship" | "friction" | "recommendations";
export type ReportExportFormat = "pdf" | "excel";

export interface ReportExportPayloadInterface {
    projectId: string;
    section: ReportSectionKey;
    format: ReportExportFormat;
}
