import type { DecisionCategory, DecisionStatus } from "@/enums";

export interface DecisionInterface {
    id: string;
    title: string;
    status: DecisionStatus;
    created_at: string;
    decided_at?: string;
    description?: string;
    context?: string;
    ownerId?: string;
    participants?: string[];
    category?: DecisionCategory;
    outcome?: string;
}

export interface DecisionsListResponseInterface {
    data: DecisionInterface[];
    isSuccess: boolean;
}

export interface DecisionDetailResponseInterface {
    data: DecisionInterface;
    isSuccess: boolean;
}

export interface CreateDecisionPayloadInterface {
    title: string;
    status?: string;
    decided_at?: string;
}

export interface UpdateDecisionPayloadInterface {
    title?: string;
    status?: string;
    decided_at?: string;
}

export interface DecisionsListFiltersInterface {
    status?: string;
    per_page?: number;
}

export interface DecisionsContextInterface {
    decisions: DecisionInterface[];
    isLoading: boolean;
    refetch: (filters?: DecisionsListFiltersInterface) => Promise<void>;
    patchDecisionLocal: (decision: DecisionInterface) => void;
    removeDecisionLocal: (id: string) => void;
}
