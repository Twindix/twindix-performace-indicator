import type { UserInterface } from "@/interfaces/common";

export interface UserListParamsInterface {
    page?: number;
    per_page?: number;
    role_tier?: string;
    team_id?: string;
}

export interface UserPaginationMetaInterface {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export interface UserListResponseInterface {
    data: UserInterface[];
    meta: UserPaginationMetaInterface;
}

export interface CreateUserPayloadInterface {
    full_name: string;
    email: string;
    password: string;
    role_tier: string;
    team_id: string;
}

export interface UpdateUserPayloadInterface {
    full_name?: string;
    email?: string;
    role_tier?: string;
    team_id?: string;
    account_status?: string;
}

export interface UserAnalyticsTasksByPhaseInterface {
    phase: string;
    count: number;
}

export interface UserAnalyticsTasksInterface {
    total: number;
    done: number;
    in_progress: number;
    blocked: number;
    total_points: number;
    done_points: number;
    delivery_rate: number;
    by_phase: UserAnalyticsTasksByPhaseInterface[];
}

export interface UserAnalyticsCommunicationInterface {
    asked: number;
    received: number;
    answered: number;
    response_rate: number;
    avg_response_time_hours: number;
    response_time_distribution: {
        under_1h: number;
        one_to_4h: number;
        four_to_24h: number;
        over_24h: number;
    };
}

export interface UserAnalyticsBlockerItemInterface {
    id: string;
    title: string;
    status: string;
    duration_days: number;
}

export interface UserAnalyticsBlockersInterface {
    reported: number;
    owned: number;
    resolved: number;
    resolve_rate: number;
    list: UserAnalyticsBlockerItemInterface[];
}

export interface UserAnalyticsAlertsInterface {
    received: number;
    acknowledged: number;
    ack_rate: number;
}

export interface UserAnalyticsRedFlagsInterface {
    raised: number;
    total_in_sprint: number;
}

export interface UserAnalyticsCommentsInterface {
    written: number;
    mentioned: number;
    answered: number;
    answer_rate: number;
}

export interface UserAnalyticsInterface {
    tasks: UserAnalyticsTasksInterface;
    communication: UserAnalyticsCommunicationInterface;
    blockers: UserAnalyticsBlockersInterface;
    alerts: UserAnalyticsAlertsInterface;
    red_flags: UserAnalyticsRedFlagsInterface;
    comments: UserAnalyticsCommentsInterface;
}
