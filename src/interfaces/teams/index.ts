export interface TeamMemberInterface {
    id: string;
    full_name: string;
    avatar_initials: string;
}

export interface TeamInterface {
    id: string;
    name: string;
    description?: string | null;
    member_count?: number;
    members?: TeamMemberInterface[];
    created_at?: string;
    updated_at?: string;
}

export interface TeamsListResponseInterface {
    data: TeamInterface[];
}

export interface TeamDetailResponseInterface {
    data: TeamInterface;
}

export interface CreateTeamPayloadInterface {
    name: string;
    description?: string;
}

export interface UpdateTeamPayloadInterface extends Partial<CreateTeamPayloadInterface> {}

export interface TeamLiteInterface {
    id: string;
    name: string;
}

// --- Component prop interfaces ---

export interface TeamsHeaderPropsInterface {
    canCreate: boolean;
    onCreate: () => void;
}

export interface TeamCardPropsInterface {
    team: TeamInterface;
    canManage: boolean;
    onClick: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

export interface TeamsGridPropsInterface {
    teams: TeamInterface[];
    isLoading: boolean;
    deleteTargetId: string | null;
    canManage: boolean;
    onCardClick: (id: string) => void;
    onEdit: (team: TeamInterface) => void;
    onDelete: (team: TeamInterface) => void;
}

export interface TeamFormFieldsInterface {
    name: string;
    description: string;
    nameError?: string;
    descriptionError?: string;
}

export interface TeamFormHandlersInterface {
    onNameChange: (value: string) => void;
    onDescriptionChange: (value: string) => void;
    onSubmit: () => void;
    onClose: () => void;
}

export interface TeamFormDialogPropsInterface {
    open: boolean;
    editTarget: TeamInterface | null;
    fields: TeamFormFieldsInterface;
    handlers: TeamFormHandlersInterface;
    isSubmitting: boolean;
}

export interface DeleteTeamDialogPropsInterface {
    open: boolean;
    teamName: string | undefined;
    isDeleting: boolean;
    onConfirm: () => void;
    onClose: () => void;
}

export interface TeamDetailDialogPropsInterface {
    teamId: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

// --- Hook return interface ---

export interface UseTeamsViewReturnInterface {
    teams: TeamInterface[];
    isLoading: boolean;
    addOpen: boolean;
    editTarget: TeamInterface | null;
    deleteTarget: TeamInterface | null;
    detailTeamId: string | null;
    formFields: TeamFormFieldsInterface;
    formHandlers: TeamFormHandlersInterface;
    isSubmitting: boolean;
    isDeleting: boolean;
    canCreate: boolean;
    canManage: boolean;
    onCardClick: (id: string) => void;
    onEdit: (team: TeamInterface) => void;
    onDelete: (team: TeamInterface) => void;
    onDeleteConfirm: () => void;
    onDeleteClose: () => void;
    onDetailClose: () => void;
    onAddOpen: () => void;
}
