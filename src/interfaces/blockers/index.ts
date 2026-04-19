import type { BlockerStatus, BlockerType } from "@/enums";

export interface BlockerInterface {
    id: string;
    title: string;
    description?: string;
    type: BlockerType;
    status: BlockerStatus;
    severity: string;
    reporter: { id: string; full_name: string; avatar_initials: string };
    owner: { id: string; full_name: string; avatar_initials: string };
    tasks?: { id: string; title: string }[];
    created_at: string;
    resolved_at?: string | null;
    duration_days?: number;
}

export interface BlockersAnalyticsInterface {
    total: number;
    active: number;
    resolved: number;
    avg_duration_days: number;
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

export type BlockersAnalyticsResponseInterface = BlockersAnalyticsInterface;

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
