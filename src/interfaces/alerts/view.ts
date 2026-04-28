import type { ReactNode } from "react";

import type { UserInterface } from "@/interfaces/common";

import type {
    AlertCreatorInterface,
    AlertFormStateInterface,
    AlertInterface,
    AlertSourceTaskInterface,
    AlertType,
} from "./domain";

// === View shared groupings ===

export interface AlertCardPermissionsInterface {
    edit: boolean;
    delete: boolean;
    acknowledge: boolean;
    markDone: boolean;
    goToTask: boolean;
}

export interface AlertCardBusyInterface {
    acknowledge: boolean;
    markDone: boolean;
}

export interface AlertCardActionsInterface {
    onEdit: () => void;
    onDelete: () => void;
    onAcknowledge: () => void;
    onMarkDone: () => void;
    onOpenTask: (taskId?: string | null) => void;
}

export interface AlertCardCountsInterface {
    acknowledged: number;
    total: number;
}

export interface AlertCardFooterActionsInterface {
    onAcknowledge: () => void;
    onMarkDone: () => void;
    onOpenTask: (taskId?: string | null) => void;
}

export interface AlertFormControlInterface {
    value: AlertFormStateInterface;
    onChange: (form: AlertFormStateInterface) => void;
}

export interface AlertFormDialogActionsInterface {
    onClose: () => void;
    onSubmit: () => void;
}

// === Component prop interfaces ===

export interface AlertCardPropsInterface {
    alert: AlertInterface;
    permissions: AlertCardPermissionsInterface;
    busy: AlertCardBusyInterface;
    actions: AlertCardActionsInterface;
}

export interface AlertCardComputedPropsInterface {
    permissions: AlertCardPermissionsInterface;
    busy: AlertCardBusyInterface;
    actions: AlertCardActionsInterface;
}

export interface AlertCardHeaderPropsInterface {
    type?: AlertType;
    title: string;
    body: string;
    sourceTask: AlertSourceTaskInterface | null | undefined;
    onOpenTask: (taskId?: string | null) => void;
}

export interface AlertCardActionsPanelPropsInterface {
    canEdit: boolean;
    canDelete: boolean;
    onEdit: () => void;
    onDelete: () => void;
}

export interface AlertCardMetaPropsInterface {
    creator: AlertCreatorInterface | null;
    target: string;
    createdAt: string;
}

export interface AlertCardMentionsPropsInterface {
    users: AlertCreatorInterface[];
}

export interface AlertCardFooterPropsInterface {
    isReviewTitle: boolean;
    sourceTaskId: string | null;
    counts: AlertCardCountsInterface;
    permissions: AlertCardPermissionsInterface;
    busy: AlertCardBusyInterface;
    actions: AlertCardFooterActionsInterface;
}

export interface AlertsHeaderPropsInterface {
    canCreate: boolean;
    onCreate: () => void;
}

export interface AlertsFiltersPropsInterface {
    value: string;
    onChange: (value: string) => void;
}

export interface AlertsTabsPropsInterface {
    pendingCount: number;
    doneCount: number;
    pendingChildren: ReactNode;
    doneChildren: ReactNode;
}

export interface PendingAlertsTabPropsInterface {
    isLoading: boolean;
    isEmpty: boolean;
    children: ReactNode;
}

export interface DoneAlertsTabPropsInterface {
    isEmpty: boolean;
    children: ReactNode;
}

export interface UserMultiSelectPropsInterface {
    users: UserInterface[];
    selected: string[];
    onChange: (ids: string[]) => void;
}

export interface SelectedUserChipsPropsInterface {
    users: UserInterface[];
    onRemove: (id: string) => void;
}

export interface UserSearchInputPropsInterface {
    value: string;
    onChange: (value: string) => void;
}

export interface UserOptionListPropsInterface {
    users: UserInterface[];
    selected: string[];
    onToggle: (id: string) => void;
}

export interface AlertFormDialogPropsInterface {
    open: boolean;
    isEdit: boolean;
    isSubmitting: boolean;
    form: AlertFormControlInterface;
    users: UserInterface[];
    actions: AlertFormDialogActionsInterface;
}

export interface DeleteAlertDialogPropsInterface {
    open: boolean;
    isLoading: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

// === Hook arg / return types ===

export interface UseAlertFormArgsInterface {
    activeSprintId: string;
    onSaved: (alert: AlertInterface) => void;
}

export interface UseAlertFormReturnInterface {
    isOpen: boolean;
    isEdit: boolean;
    isSubmitting: boolean;
    value: AlertFormStateInterface;
    onChange: (form: AlertFormStateInterface) => void;
    open: () => void;
    openEdit: (alert: AlertInterface) => void;
    close: () => void;
    onSubmit: () => Promise<void>;
}

export interface UseAlertActionsArgsInterface {
    onPatch: (alert: AlertInterface) => void;
    onRemove: (id: string) => void;
}

export interface UseAlertActionsReturnInterface {
    deleteTarget: AlertInterface | null;
    isDeleting: boolean;
    busyFor: (alertId: string) => AlertCardBusyInterface;
    acknowledge: (id: string) => Promise<void>;
    markDone: (id: string) => Promise<void>;
    requestDelete: (alert: AlertInterface) => void;
    cancelDelete: () => void;
    confirmDelete: () => Promise<void>;
}

export interface UseUserMultiSelectArgsInterface {
    users: UserInterface[];
    selected: string[];
    onChange: (ids: string[]) => void;
}

export interface UseUserMultiSelectReturnInterface {
    search: string;
    setSearch: (value: string) => void;
    filtered: UserInterface[];
    selectedUsers: UserInterface[];
    toggle: (id: string) => void;
}

export interface UseAlertsViewReturnInterface {
    permissions: import("@/hooks/shared/use-permissions").Permissions;
    typeFilter: string;
    setTypeFilter: (value: string) => void;
    pendingAlerts: AlertInterface[];
    doneAlerts: AlertInterface[];
    isLoading: boolean;
    users: UserInterface[];
    form: UseAlertFormReturnInterface;
    actions: UseAlertActionsReturnInterface;
    onOpenTask: (taskId?: string | null) => void;
    cardPropsFor: (alert: AlertInterface) => AlertCardComputedPropsInterface;
}
