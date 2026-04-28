import type { UserInterface } from "@/interfaces/common";

export interface CommentUserInterface {
    id: string;
    full_name: string;
    avatar_initials: string;
}

export interface CommentInterface {
    id: string;
    task_id: string | null;
    task_title: string | null;
    body: string;
    author: CommentUserInterface;
    response_status: string | null;
    responded_at: string | null;
    mentioned_users: CommentUserInterface[];
    created_at: string;
}

export interface CommentsMetaInterface {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export interface CommentsListResponseInterface {
    data: CommentInterface[];
    meta: CommentsMetaInterface;
}

export interface CommentDetailResponseInterface {
    data: CommentInterface;
}

export interface CommentsAnalyticsInterface {
    total_comments: number;
    with_mention: number;
    responded: number;
    no_response: number;
}

export interface CommentsAnalyticsResponseInterface {
    data: CommentsAnalyticsInterface;
}

export interface CreateCommentPayloadInterface {
    body: string;
    task_id?: string;
    task_title?: string;
    mentioned_user_ids?: string[];
}

export interface UpdateCommentPayloadInterface {
    body?: string;
    mentioned_user_ids?: string[];
}

export interface CommentsListFiltersInterface {
    status?: string;
    mention?: string;
    per_page?: number;
}

// --- View shared types ---

export interface CommentsStatsInterface {
    total: number;
    withMention: number;
    withResponse: number;
    noResponse: number;
}

export interface CommentFormState {
    body: string;
    task_title: string;
    mentioned_user_ids: string[];
}

export interface CommentFormHandlersInterface {
    onBodyChange: (v: string) => void;
    onTaskTitleChange: (v: string) => void;
    onMentionToggle: (userId: string, checked: boolean) => void;
    onSubmit: () => void;
    onClose: () => void;
}

export interface CommentsPermissionsInterface {
    canRespond: (c: CommentInterface) => boolean;
    canEdit: (c: CommentInterface) => boolean;
    canDelete: (c: CommentInterface) => boolean;
}

export interface CommentsCallbacksInterface {
    onView: (c: CommentInterface) => void;
    onEdit: (c: CommentInterface) => void;
    onDelete: (c: CommentInterface) => void;
    onRespond: (id: string) => void;
}

export interface CommentCardActionsInterface {
    canRespond: boolean;
    canEdit: boolean;
    canDelete: boolean;
    onRespond: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

// --- Prop interfaces ---

export interface CommentsHeaderPropsInterface {
    canAdd: boolean;
    onAdd: () => void;
}

export interface CommentsStatsGridPropsInterface {
    stats: CommentsStatsInterface;
    compact: boolean;
}

export interface CommentsFilterHandlersInterface {
    onMentionChange: (v: string) => void;
    onResponseChange: (v: string) => void;
    onClear: () => void;
}

export interface CommentsFiltersPropsInterface {
    mentionFilter: string;
    responseFilter: string;
    users: UserInterface[];
    count: number;
    compact: boolean;
    handlers: CommentsFilterHandlersInterface;
}

export interface CommentsListPropsInterface {
    comments: CommentInterface[];
    permissions: CommentsPermissionsInterface;
    callbacks: CommentsCallbacksInterface;
}

export interface CommentCardPropsInterface {
    comment: CommentInterface;
    permissions: CommentsPermissionsInterface;
    callbacks: CommentsCallbacksInterface;
}

export interface CommentCardHeaderPropsInterface {
    taskTitle: string | null;
    hasResponse: boolean;
    actions: CommentCardActionsInterface;
}

export interface CommentCardBodyPropsInterface {
    body: string;
    onClick: () => void;
}

export interface CommentCardMetaPropsInterface {
    comment: CommentInterface;
}

export interface CommentFormDialogPropsInterface {
    open: boolean;
    editTarget: CommentInterface | null;
    form: CommentFormState;
    users: UserInterface[];
    handlers: CommentFormHandlersInterface;
    busy: boolean;
}

export interface CommentDetailDialogPropsInterface {
    comment: CommentInterface | null;
    onClose: () => void;
}

export interface DeleteCommentDialogPropsInterface {
    open: boolean;
    onConfirm: () => void;
    onClose: () => void;
}

// --- Hook return ---

export interface UseCommentsViewReturnInterface {
    comments: CommentInterface[];
    stats: CommentsStatsInterface;
    users: UserInterface[];
    isLoading: boolean;
    compact: boolean;
    mentionFilter: string;
    responseFilter: string;
    filterHandlers: CommentsFilterHandlersInterface;
    viewTarget: CommentInterface | null;
    addOpen: boolean;
    editTarget: CommentInterface | null;
    deleteTarget: CommentInterface | null;
    form: CommentFormState;
    formHandlers: CommentFormHandlersInterface;
    canAdd: boolean;
    permissions: CommentsPermissionsInterface;
    callbacks: CommentsCallbacksInterface;
    onAddOpen: () => void;
    onViewClose: () => void;
    onDeleteClose: () => void;
    onDeleteConfirm: () => void;
    busy: boolean;
}
