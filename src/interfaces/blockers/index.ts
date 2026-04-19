import type { BlockerImpact, BlockerStatus, BlockerType } from "@/enums";

export interface BlockerInterface {
    id: string;
    title: string;
    description: string;
    type: BlockerType;
    status: BlockerStatus;
    impact: BlockerImpact;
    severity?: string;
    reporterId: string;
    ownerId: string;
    taskIds: string[];
    sprintId: string;
    createdAt: string;
    resolvedAt?: string;
    durationDays: number;
    notes: string;
}

export interface BlockersAnalyticsInterface {
    total: number;
    active: number;
    resolved: number;
    avg_duration: number;
    by_type?: Record<string, number>;
    by_severity?: Record<string, number>;
}

export interface BlockersListResponseInterface {
    data: BlockerInterface[];
    isSuccess: boolean;
}

export interface BlockerDetailResponseInterface {
    data: BlockerInterface;
    isSuccess: boolean;
}

export interface BlockersAnalyticsResponseInterface {
    data: BlockersAnalyticsInterface;
    isSuccess: boolean;
}

export interface CreateBlockerPayloadInterface {
    title: string;
    description?: string;
    severity: string;
    type: BlockerType;
    owned_by: string;
    task_ids?: string[];
}

export interface UpdateBlockerPayloadInterface {
    title?: string;
    description?: string;
    severity?: string;
    type?: BlockerType;
    owned_by?: string;
}

export interface BlockersListFiltersInterface {
    status?: BlockerStatus;
    type?: BlockerType;
    severity?: string;
    reporter?: string;
    owner?: string;
    per_page?: number;
}

export interface BlockersContextInterface {
    blockers: BlockerInterface[];
    analytics: BlockersAnalyticsInterface | null;
    isLoading: boolean;
    refetch: (filters?: BlockersListFiltersInterface) => Promise<void>;
    refetchAnalytics: () => Promise<void>;
    patchBlockerLocal: (blocker: BlockerInterface) => void;
    removeBlockerLocal: (id: string) => void;
}
