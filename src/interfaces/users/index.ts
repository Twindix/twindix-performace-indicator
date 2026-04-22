import type { RoleTier } from "@/constants/permissions";
import type { UserInterface } from "@/interfaces/common";

export interface UserListParamsInterface {
    page?: number;
    per_page?: number;
    role_tier?: RoleTier;
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

export interface UserLiteInterface {
    id: string;
    full_name: string;
    avatar_initials: string;
    email?: string;
    role_label?: string | null;
}

export interface CreateUserPayloadInterface {
    full_name: string;
    email: string;
    password: string;
    role_label: string;
    role_tier: RoleTier;
    team_id: string;
    avatar_initials?: string;
}

export interface UpdateUserPayloadInterface {
    full_name?: string;
    email?: string;
    role_tier?: RoleTier;
    team_id?: string;
    account_status?: string;
}

export interface UserAnalyticsAssignedTaskInterface {
    id: string;
    title: string;
    story_points: string;
    readiness_percent: number;
    status: string;
    is_blocked: boolean;
}

export interface UserAnalyticsInterface {
    user: { id: string; full_name: string; email: string; role_label: string; team: string; avatar_initials: string };
    sprint_filter: string;
    top_stats: {
        delivery_rate: number;
        points_done: { done: number; total: number };
        avg_response_hours: number;
    };
    quick_stats: {
        tasks_assigned: number;
        tasks_done: number;
        comm_response_rate: number;
        comm_avg_response_hours: number;
        blocker_resolve_rate: number;
        blockers_resolved: number;
        blockers_owned: number;
    };
    tasks_by_phase: {
        backlog: number;
        ready: number;
        in_progress: number;
        review: number;
        qa: number;
        done: number;
    };
    communication_performance: {
        questions_asked: number;
        questions_received: number;
        answered: number;
        response_rate: number;
        response_time_distribution: {
            under_1h: number;
            "1_to_4h": number;
            "4_to_24h": number;
            over_24h: number;
        };
    };
    blocker_activity: {
        reported: number;
        owned: number;
        resolved: number;
        resolve_rate: number;
    };
    assigned_tasks: UserAnalyticsAssignedTaskInterface[];
    alerts_engagement: {
        received: number;
        acknowledged: number;
        ack_rate: number;
    };
    red_flags: {
        raised_by_user: number;
        total_in_sprint: number;
    };
    comments_activity: {
        written: number;
        mentioned_in: number;
        answered: number;
        answer_rate: number;
    };
}
