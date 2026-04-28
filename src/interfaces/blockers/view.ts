import type { Permissions } from "@/hooks/shared/use-permissions";
import type { UserInterface } from "@/interfaces/common";

import type {
    BlockerInterface,
    BlockerTaskInterface,
    BlockerUserInterface,
} from "./domain";

// === View shared groupings ===

export interface BlockerStatsInterface {
    total: number;
    active: number;
    resolved: number;
    avgDuration: number;
}

export interface BlockerFormStateInterface {
    title: string;
    description: string;
    severity: string;
    type: string;
    ownedBy: string;
}

export interface BlockersFiltersValuesInterface {
    status: string;
    type: string;
    severity: string;
    owner: string;
    reporter: string;
}

export interface BlockersFiltersControlInterface {
    values: BlockersFiltersValuesInterface;
    onChange: (key: keyof BlockersFiltersValuesInterface, value: string) => void;
    onClear: () => void;
}

export interface BlockerDetailHeaderPermissionsInterface {
    canEdit: boolean;
    canDelete: boolean;
}

export interface BlockerDetailActionsPermissionsInterface {
    canResolve: boolean;
    canEscalate: boolean;
}

export interface BlockerDetailActionsBusyInterface {
    resolving: boolean;
    escalating: boolean;
}

export interface BlockerDetailActionsStatusInterface {
    isResolved: boolean;
    isEscalated: boolean;
    resolvedAt: string | null;
}

// === Hook arg / return types ===

export interface UseBlockersListOptionsInterface {
    status?: string;
    type?: string;
    severity?: string;
    reporter?: string;
    owner?: string;
    per_page?: number;
}

export interface UseBlockerFormArgsInterface {
    sprintId: string;
    onSaved: (blocker: BlockerInterface) => void;
}

export interface UseBlockerFormReturnInterface {
    isOpen: boolean;
    isEdit: boolean;
    isSubmitting: boolean;
    value: BlockerFormStateInterface;
    onChange: (form: BlockerFormStateInterface) => void;
    openAdd: () => void;
    openEdit: (blocker: BlockerInterface) => void;
    close: () => void;
    onSubmit: () => Promise<void>;
}

export interface UseBlockerDetailArgsInterface {
    onPatch: (blocker: BlockerInterface) => void;
    onDelete: (id: string) => void;
    refetchAnalytics: () => unknown;
}

export interface UseBlockerDetailReturnInterface {
    isOpen: boolean;
    current: BlockerInterface | null;
    isResolving: boolean;
    isEscalating: boolean;
    isDeleting: boolean;
    open: (blocker: BlockerInterface) => void;
    close: () => void;
    onResolve: () => Promise<void>;
    onEscalate: () => Promise<void>;
    onDelete: () => Promise<void>;
}

export interface UseBlockersViewReturnInterface {
    permissions: Permissions;
    activeSprintId: string;
    compact: boolean;
    blockers: BlockerInterface[];
    stats: BlockerStatsInterface;
    isLoading: boolean;
    users: UserInterface[];
    filters: BlockersFiltersControlInterface;
    formDialog: UseBlockerFormReturnInterface;
    detailDialog: UseBlockerDetailReturnInterface;
}

// === Component prop interfaces ===

export interface BlockersHeaderPropsInterface {
    canCreate: boolean;
    onCreate: () => void;
}

export interface BlockersStatsPropsInterface {
    stats: BlockerStatsInterface;
    compact: boolean;
}

export interface BlockersFiltersPropsInterface {
    values: BlockersFiltersValuesInterface;
    onChange: (key: keyof BlockersFiltersValuesInterface, value: string) => void;
    onClear: () => void;
    users: UserInterface[];
    blockerCount: number;
    compact: boolean;
}

export interface BlockersListPropsInterface {
    blockers: BlockerInterface[];
    compact: boolean;
    onSelect: (blocker: BlockerInterface) => void;
}

export interface BlockerCardPropsInterface {
    blocker: BlockerInterface;
    compact: boolean;
    onClick: () => void;
}

export interface BlockerCardHeaderPropsInterface {
    type: string;
    title: string;
    description: string | null;
    status: string | null;
    severity: string;
}

export interface BlockerCardMetaPropsInterface {
    reporter: BlockerUserInterface | null;
    owner: BlockerUserInterface | null;
    durationDays: string | number | null;
    createdAt: string;
    tasksAffected: string | number | null;
}

export interface BlockerFormDialogPropsInterface {
    open: boolean;
    isEdit: boolean;
    isSubmitting: boolean;
    form: { value: BlockerFormStateInterface; onChange: (form: BlockerFormStateInterface) => void };
    users: UserInterface[];
    actions: { onClose: () => void; onSubmit: () => void };
}

export interface BlockerFormFieldsPropsInterface {
    value: BlockerFormStateInterface;
    onChange: (form: BlockerFormStateInterface) => void;
    users: UserInterface[];
}

export interface BlockerDetailDialogPropsInterface {
    open: boolean;
    blocker: BlockerInterface | null;
    permissions: Permissions;
    detail: Pick<UseBlockerDetailReturnInterface, "isResolving" | "isEscalating" | "isDeleting" | "onResolve" | "onEscalate" | "onDelete">;
    actions: { onClose: () => void; onEdit: (blocker: BlockerInterface) => void };
}

export interface BlockerDetailHeaderPropsInterface {
    blocker: BlockerInterface;
    permissions: BlockerDetailHeaderPermissionsInterface;
    isDeleting: boolean;
    onEdit: () => void;
    onDelete: () => void;
}

export interface BlockerDetailMetaPropsInterface {
    reporter: BlockerUserInterface | null;
    owner: BlockerUserInterface | null;
    createdAt: string;
    durationDays: string | number | null;
}

export interface BlockerDetailLinkedTasksPropsInterface {
    tasks: BlockerTaskInterface[];
}

export interface BlockerDetailActionsPropsInterface {
    status: BlockerDetailActionsStatusInterface;
    permissions: BlockerDetailActionsPermissionsInterface;
    busy: BlockerDetailActionsBusyInterface;
    onResolve: () => void;
    onEscalate: () => void;
}
