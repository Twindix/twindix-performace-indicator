export type ProjectStatus = "planning" | "active" | "completed" | "on_hold";

export type ProjectStatusBadgeVariant = "success" | "warning" | "default" | "secondary";

export interface ProjectCreatorInterface {
    id: string;
    full_name: string;
    avatar_initials: string;
}

export interface ProjectInterface {
    id: string;
    name: string;
    description?: string | null;
    start_date?: string | null;
    end_date?: string | null;
    status: ProjectStatus;
    sprint_count?: number;
    member_count?: number;
    created_by?: ProjectCreatorInterface | null;
    created_at?: string;
    // legacy aliases — keep for any older code paths
    sprints_count?: number;
    members_count?: number;
}

export interface CreateProjectPayloadInterface {
    name: string;
    description?: string;
    start_date?: string;
    end_date?: string;
    status?: ProjectStatus;
}

export interface UpdateProjectPayloadInterface extends Partial<CreateProjectPayloadInterface> {}

export interface ProjectLiteInterface {
    id: string;
    name: string;
    status: ProjectStatus;
}

export interface ProjectFormStateInterface {
    name: string;
    description: string;
    start_date: string;
    end_date: string;
    status: ProjectStatus;
}

export interface ProjectCountsInterface {
    sprintCount: number;
    memberCount: number;
}

export interface ProjectListPermissionsInterface {
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
}

export interface ProjectFormControlInterface {
    value: ProjectFormStateInterface;
    onPatch: (patch: Partial<ProjectFormStateInterface>) => void;
    getError: (field: string) => string | undefined;
    clearError: (field: string) => void;
}

export interface UseProjectsPageReturnInterface {
    projects: ProjectInterface[];
    isLoading: boolean;
    permissions: ProjectListPermissionsInterface;
    openedProject: ProjectInterface | null;
    onEnterProject: (project: ProjectInterface) => void;
    onLeaveProject: () => void;
    form: ProjectFormControlInterface;
    formDialog: {
        isOpen: boolean;
        isEditMode: boolean;
        isSubmitting: boolean;
        onOpenAdd: () => void;
        onOpenEdit: (project: ProjectInterface) => void;
        onClose: () => void;
        onSubmit: () => Promise<void>;
    };
    deleteDialog: {
        target: ProjectInterface | null;
        isDeleting: boolean;
        onOpen: (project: ProjectInterface) => void;
        onClose: () => void;
        onConfirm: () => Promise<void>;
    };
}

export interface OpenedProjectViewPropsInterface {
    project: ProjectInterface;
    onBack: () => void;
}

export interface ProjectsGridPropsInterface {
    projects: ProjectInterface[];
    permissions: ProjectListPermissionsInterface;
    onOpen: (project: ProjectInterface) => void;
    onEdit: (project: ProjectInterface) => void;
    onDelete: (project: ProjectInterface) => void;
}

export interface ProjectCardPropsInterface {
    project: ProjectInterface;
    permissions: ProjectListPermissionsInterface;
    onOpen: (project: ProjectInterface) => void;
    onEdit: (project: ProjectInterface) => void;
    onDelete: (project: ProjectInterface) => void;
}

export interface ProjectCardHeaderPropsInterface {
    project: ProjectInterface;
    onOpen: () => void;
}

export interface ProjectCardActionsPropsInterface {
    canEdit: boolean;
    canDelete: boolean;
    onEdit: () => void;
    onDelete: () => void;
}

export interface ProjectCardMetaPropsInterface {
    description?: string | null;
    startDate?: string | null;
    endDate?: string | null;
}

export interface ProjectCardFooterPropsInterface {
    counts: ProjectCountsInterface;
}

export interface ProjectFormDialogPropsInterface {
    isOpen: boolean;
    isEditMode: boolean;
    form: ProjectFormControlInterface;
    isSubmitting: boolean;
    onClose: () => void;
    onSubmit: () => void;
}

export interface DeleteProjectDialogPropsInterface {
    target: ProjectInterface | null;
    isDeleting: boolean;
    onClose: () => void;
    onConfirm: () => void;
}
