import type { DecisionStatus } from "@/enums";

import type {
    DecisionFormErrorsInterface,
    DecisionFormStateInterface,
    DecisionInterface,
    DecisionsPageFiltersInterface,
} from "./domain";

export interface DecisionsStatsPropsInterface {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
    compact: boolean;
}

export interface DecisionsFiltersPropsInterface {
    filters: DecisionsPageFiltersInterface;
    count: number;
    compact: boolean;
    onFilterChange: <K extends keyof DecisionsPageFiltersInterface>(field: K, value: DecisionsPageFiltersInterface[K]) => void;
    onClear: () => void;
}

export interface DecisionsListPropsInterface {
    decisions: DecisionInterface[];
    canSetStatus: boolean;
    compact: boolean;
    onView: (decision: DecisionInterface) => void;
    onSetStatus: (id: string, status: DecisionStatus) => void;
}

export interface DecisionCardPropsInterface {
    decision: DecisionInterface;
    canSetStatus: boolean;
    compact: boolean;
    onView: (decision: DecisionInterface) => void;
    onSetStatus: (id: string, status: DecisionStatus) => void;
}

export interface DecisionPermissionsInterface {
    setStatus: boolean;
    delete: boolean;
}

export interface DecisionDetailDialogPropsInterface {
    target: DecisionInterface | null;
    isLoadingDetail: boolean;
    permissions: DecisionPermissionsInterface;
    onOpenChange: (open: boolean) => void;
    onSetStatus: (id: string, status: DecisionStatus) => void;
    onDelete: (id: string) => void;
}

export interface DecisionStatusActionsPropsInterface {
    decision: DecisionInterface;
    onSetStatus: (id: string, status: DecisionStatus) => void;
}

export interface DecisionDetailBodyPropsInterface {
    decision: DecisionInterface;
}

export interface AddDecisionDialogPropsInterface {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreated: (decision: DecisionInterface) => void;
}

export interface UseDecisionFormReturnInterface {
    form: DecisionFormStateInterface;
    errors: DecisionFormErrorsInterface;
    isSubmitting: boolean;
    setField: <K extends keyof DecisionFormStateInterface>(field: K, value: DecisionFormStateInterface[K]) => void;
    reset: () => void;
    submit: () => Promise<DecisionInterface | null>;
}

export interface UseDecisionViewActionsArgsInterface {
    onPatched: (decision: DecisionInterface) => void;
    onRemoved: (id: string) => void;
    onAfterChange: () => void;
}

export interface UseDecisionViewActionsReturnInterface {
    viewTarget: DecisionInterface | null;
    isLoadingDetail: boolean;
    handleView: (decision: DecisionInterface) => Promise<void>;
    handleSetStatus: (id: string, status: DecisionStatus) => Promise<void>;
    handleDelete: (id: string) => Promise<void>;
    closeView: () => void;
}
