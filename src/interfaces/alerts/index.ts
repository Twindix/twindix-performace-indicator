export interface AlertCreatorInterface {
    id: string;
    full_name: string;
    avatar_initials: string;
}

export type AlertType = "manual" | "auto_alarm" | "dependency_resolved" | "task_completion_review" | "requirements_approved";

export interface AlertSourceTaskInterface {
    id: string;
    code?: string;
    title: string;
}

export interface AlertInterface {
    id: string;
    title: string;
    body: string;
    status: string;
    target: string;
    type?: AlertType;
    source_task?: AlertSourceTaskInterface | null;
    creator: AlertCreatorInterface | null;
    mentioned_users: AlertCreatorInterface[];
    acknowledgment_count: number;
    total_targets: number;
    created_at: string;
}

export interface AlertsListResponseInterface {
    data: AlertInterface[];
}

export interface AlertDetailResponseInterface {
    data: AlertInterface;
}

export interface AlertsCountInterface {
    count: number;
}

export interface CreateAlertPayloadInterface {
    title: string;
    body?: string;
    target: string;
    mentioned_user_ids?: string[];
}

export interface UpdateAlertPayloadInterface {
    title?: string;
    body?: string;
    target?: string;
    mentioned_user_ids?: string[];
}
