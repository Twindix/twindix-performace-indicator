import type { BlockerType } from "@/enums";
import type { PaginatedResponseInterface, PaginationParamsInterface } from "@/interfaces/common";

export interface BlockerUserInterface {
    id: string;
    full_name: string;
    avatar_initials: string;
}

export interface BlockerTaskInterface {
    id: string;
    title: string;
}

export interface BlockerInterface {
    id: string;
    title: string;
    description: string | null;
    status: string | null;
    severity: string;
    type: string;
    reporter: BlockerUserInterface;
    owner: BlockerUserInterface;
    duration_days: string | number | null;
    tasks_affected: string | number | null;
    resolved_at: string | null;
    tasks?: BlockerTaskInterface[];
    created_at: string;
}

export type BlockersListResponseInterface = PaginatedResponseInterface<BlockerInterface>;

export interface BlockerDetailResponseInterface {
    data: BlockerInterface;
}

export interface BlockersAnalyticsInterface {
    total: number;
    active: number;
    resolved: number;
    avg_duration_days: number;
    by_type: Array<{ type: string; count: number }>;
    by_severity: Array<{ severity: string; count: number }>;
}

export interface CreateBlockerPayloadInterface {
    title: string;
    description?: string;
    severity: string;
    type: string;
    owned_by: string;
    task_ids?: string[];
}

export interface UpdateBlockerPayloadInterface {
    title?: string;
    description?: string;
    severity?: string;
    type?: string;
    owned_by?: string;
}

export interface BlockersListFiltersInterface extends PaginationParamsInterface {
    status?: string;
    type?: string;
    severity?: string;
    reporter?: string;
    owner?: string;
}

export interface LinkBlockerTasksPayloadInterface {
    task_ids: string[];
}

// Legacy re-export kept for `BlockerType` enum consumers.
export type { BlockerType };
