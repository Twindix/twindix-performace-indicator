import type { PaginatedResponseInterface, PaginationParamsInterface } from "@/interfaces/common";

export type OwnershipItemType = "feature" | "task";
export type FeatureStatus = "draft" | "active" | "shipped" | "archived";

export interface OwnershipCreatorInterface {
    id: string;
    name: string;
    avatar?: string | null;
    avatar_initials?: string | null;
}

export interface OwnershipFeedItemInterface {
    id: string;
    type: OwnershipItemType;
    title: string;
    description?: string | null;
    status: FeatureStatus | string;
    creator: OwnershipCreatorInterface;
    project_name?: string | null;
    tags: string[];
    linked_tasks_count: number;
    created_at: string;
    updated_at: string;
}

export interface OwnershipFeedFiltersInterface extends PaginationParamsInterface {
    type?: "all" | OwnershipItemType;
    creator?: string;
    search?: string;
}

export type OwnershipFeedResponseInterface = PaginatedResponseInterface<OwnershipFeedItemInterface>;

export interface OwnershipLeaderboardEntryInterface {
    user_id: string;
    name: string;
    avatar_initials?: string | null;
    count: number;
    features: number;
    tasks: number;
}

export interface OwnershipStatsInterface {
    total_items: number;
    features: number;
    tasks: number;
    contributors: number;
}

// Legacy seed type (kept until consumers migrate)
export interface OwnershipEntryInterface {
    id: string;
    kind: OwnershipItemType;
    name: string;
    description: string;
    creator_id: string;
    created_at: string;
    updated_at: string;
    project_id: string;
    sprint_id?: string;
    linked_task_ids: string[];
    status: FeatureStatus;
    tags: string[];
}
