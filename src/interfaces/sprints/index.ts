export interface SprintInterface {
    id: string;
    name: string;
    status: string | null;
    start_date: string;
    end_date: string;
    created_at: string;
    // Additional properties expected by the code
    startDate?: string; // Alias for start_date
    endDate?: string; // Alias for end_date
    goals?: string[];
    healthScore?: number;
}

export interface SprintMetaInterface {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export interface SprintsListResponseInterface {
    data: SprintInterface[];
    meta: SprintMetaInterface;
}

export interface SprintDetailResponseInterface {
    data: SprintInterface;
}

export interface SprintSummaryInterface {
    total_tasks: number;
    completed_tasks: number;
    total_story_points: number;
    total_estimated_hours: number;
    blocked_count: number;
}

export interface CreateSprintPayloadInterface {
    name: string;
    start_date: string;
    end_date: string;
}

export interface UpdateSprintPayloadInterface {
    name?: string;
    start_date?: string;
    end_date?: string;
}

export type SprintBadgeVariant = "success" | "outline" | "secondary";

export interface SprintBadgeInterface {
    label: string;
    variant: SprintBadgeVariant;
}

export interface SprintFormStateInterface {
    name: string;
    start_date: string;
    end_date: string;
}

export interface SprintListPermissionsInterface {
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canActivate: boolean;
}

export interface SprintFormControlInterface {
    value: SprintFormStateInterface;
    onPatch: (patch: Partial<SprintFormStateInterface>) => void;
    getError: (field: string) => string | undefined;
    clearError: (field: string) => void;
}

export interface UseSprintsPageReturnInterface {
    sprints: SprintInterface[];
    isLoading: boolean;
    permissions: SprintListPermissionsInterface;
    form: SprintFormControlInterface;
    formDialog: {
        isOpen: boolean;
        isEditMode: boolean;
        isSubmitting: boolean;
        canSubmit: boolean;
        onOpenAdd: () => void;
        onOpenEdit: (sprint: SprintInterface) => void;
        onClose: () => void;
        onSubmit: () => Promise<void>;
    };
    deleteDialog: {
        target: SprintInterface | null;
        isDeleting: boolean;
        onOpen: (sprint: SprintInterface) => void;
        onClose: () => void;
        onConfirm: () => Promise<void>;
    };
    onActivate: (sprint: SprintInterface) => Promise<void>;
}

export interface SprintsGridPropsInterface {
    sprints: SprintInterface[];
    permissions: SprintListPermissionsInterface;
    onEdit: (sprint: SprintInterface) => void;
    onDelete: (sprint: SprintInterface) => void;
    onActivate: (sprint: SprintInterface) => void;
}

export interface SprintCardPropsInterface {
    sprint: SprintInterface;
    permissions: SprintListPermissionsInterface;
    onEdit: (sprint: SprintInterface) => void;
    onDelete: (sprint: SprintInterface) => void;
    onActivate: (sprint: SprintInterface) => void;
}

export interface SprintCardHeaderPropsInterface {
    sprint: SprintInterface;
}

export interface SprintCardActionsPropsInterface {
    isActive: boolean;
    permissions: SprintListPermissionsInterface;
    onEdit: () => void;
    onDelete: () => void;
    onActivate: () => void;
}

export interface SprintCardDateRangePropsInterface {
    startDate: string;
    endDate: string;
}

export interface SprintStatusBadgePropsInterface {
    status: string | null;
}

export interface SprintFormDialogPropsInterface {
    isOpen: boolean;
    isEditMode: boolean;
    form: SprintFormControlInterface;
    isSubmitting: boolean;
    canSubmit: boolean;
    onClose: () => void;
    onSubmit: () => void;
}

export interface DeleteSprintDialogPropsInterface {
    target: SprintInterface | null;
    isDeleting: boolean;
    onClose: () => void;
    onConfirm: () => void;
}
