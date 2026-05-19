import type { PaginatedResponseInterface, PaginationParamsInterface } from "@/interfaces/common";
import type { FeatureStatus } from "@/interfaces/ownership";

export interface FeatureInterface {
    id: string;
    title: string;
    description?: string | null;
    status: FeatureStatus;
    priority?: "low" | "medium" | "high" | "critical" | null;
    project_id: string;
    created_by?: { id: string; name: string } | string | null;
    linked_tasks_count?: number;
    created_at: string;
    updated_at: string;
}

export interface CreateFeaturePayloadInterface {
    title: string;
    description?: string;
    status?: FeatureStatus;
    priority?: "low" | "medium" | "high" | "critical";
    project_id: string;
    task_ids?: string[];
}

export interface UpdateFeaturePayloadInterface extends Partial<CreateFeaturePayloadInterface> {}

export interface FeaturesListFiltersInterface extends PaginationParamsInterface {
    status?: FeatureStatus;
    project_id?: string;
    created_by?: string;
}

export type FeaturesListResponseInterface = PaginatedResponseInterface<FeatureInterface>;
