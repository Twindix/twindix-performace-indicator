import type { DecisionCategory, DecisionStatus } from "@/enums";
import type { PaginatedResponseInterface, PaginationParamsInterface } from "@/interfaces/common";

export interface DecisionCreatorInterface {
    id: string;
    full_name: string;
    avatar_initials: string;
}

export interface DecisionInterface {
    id: string;
    title: string;
    description: string | null;
    status: DecisionStatus;
    category: DecisionCategory | null;
    outcome: string | null;
    decided_at: string | null;
    created_by: DecisionCreatorInterface;
    created_at: string;
}

export type DecisionsListResponseInterface = PaginatedResponseInterface<DecisionInterface>;

export interface DecisionDetailResponseInterface {
    data: DecisionInterface;
}

export interface DecisionsAnalyticsInterface {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
    deferred: number;
}

export interface CreateDecisionPayloadInterface {
    title: string;
    description?: string;
    status?: DecisionStatus;
    category?: DecisionCategory;
    outcome?: string;
    decided_at?: string;
}

export interface UpdateDecisionPayloadInterface {
    title?: string;
    description?: string;
    status?: DecisionStatus;
    category?: DecisionCategory;
    outcome?: string;
    decided_at?: string;
}

export interface DecisionsListFiltersInterface extends PaginationParamsInterface {
    status?: DecisionStatus;
    category?: DecisionCategory;
}
