import type { PaginatedResponseInterface, PaginationParamsInterface } from "@/interfaces/common";
import type { FeatureStatus, OwnershipCreatorInterface } from "@/interfaces/ownership";

export interface FeatureInterface {
    id: string;
    title: string;
    description?: string | null;
    status: FeatureStatus;
    project_id: string;
    project_name?: string | null;
    created_by?: OwnershipCreatorInterface | null;
    tags: string[];
    linked_tasks_count?: number;
    created_at: string;
    updated_at: string;
}

export interface CreateFeaturePayloadInterface {
    title: string;
    description?: string;
    status?: FeatureStatus;
    project_id: string;
    tags?: string[];
    task_ids?: string[];
}

export interface UpdateFeaturePayloadInterface extends Partial<CreateFeaturePayloadInterface> {}

export interface FeaturesListFiltersInterface extends PaginationParamsInterface {
    status?: FeatureStatus;
    project_id?: string;
    created_by?: string;
}

export type FeaturesListResponseInterface = PaginatedResponseInterface<FeatureInterface>;
