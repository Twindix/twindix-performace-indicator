export interface AlertInterface {
    id: string;
    title: string;
    body?: string;
    target?: string;
    status?: string;
    creator: { id: string; full_name: string; avatar_initials: string };
    mentioned_users: Array<{ id: string; full_name: string; avatar_initials: string }>;
    acknowledgment_count?: number;
    total_targets?: number;
    created_at: string;
}

export interface AlertsListResponseInterface {
    data: AlertInterface[];
    isSuccess: boolean;
}

export interface AlertDetailResponseInterface {
    data: AlertInterface;
    isSuccess: boolean;
}

export interface AlertsCountInterface {
    count: number;
}

export interface AlertsCountResponseInterface {
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

export interface AlertsListFiltersInterface {
    status?: string;
    creator?: string;
    per_page?: number;
}

export interface AlertsContextInterface {
    alerts: AlertInterface[];
    count: number;
    isLoading: boolean;
    refetch: (filters?: AlertsListFiltersInterface) => Promise<void>;
    refetchCount: () => Promise<void>;
    patchAlertLocal: (alert: AlertInterface) => void;
    removeAlertLocal: (id: string) => void;
}
