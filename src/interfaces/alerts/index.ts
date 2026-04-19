export interface AlertInterface {
    id: string;
    title: string;
    body?: string;
    description?: string;
    target?: string;
    mentionedIds: string[];
    mentioned_user_ids?: string[];
    resolvedByIds: string[];
    createdById: string;
    createdAt: string;
    updatedAt: string;
    sprintId: string;
    status?: string;
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
    data: AlertsCountInterface;
    isSuccess: boolean;
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
