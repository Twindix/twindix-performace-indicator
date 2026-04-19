import type { DecisionCategory, DecisionStatus } from "@/enums";

export interface DecisionInterface {
    id: string;
    title: string;
    description: string;
    context: string;
    status: DecisionStatus;
    ownerId: string;
    participants: string[];
    sprintId: string;
    createdAt: string;
    decidedAt?: string;
    category: DecisionCategory;
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
