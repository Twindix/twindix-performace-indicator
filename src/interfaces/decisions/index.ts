import type { DecisionCategory, DecisionStatus } from "@/enums";

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

export interface DecisionsMetaInterface {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export interface DecisionsListResponseInterface {
    data: DecisionInterface[];
    meta: DecisionsMetaInterface;
}

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

export interface DecisionsListFiltersInterface {
    status?: DecisionStatus;
    category?: DecisionCategory;
    per_page?: number;
}
