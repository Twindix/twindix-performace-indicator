export interface CommentInterface {
    id: string;
    task_id?: string;
    task_title?: string;
    body: string;
    author: { id: string; full_name: string; avatar_initials: string };
    response_status: string;
    responded_at?: string;
    mentions: Array<{ id: string; full_name: string; avatar_initials: string }>;
    created_at: string;
}

export interface CommentsListResponseInterface {
    data: CommentInterface[];
    isSuccess: boolean;
}

export interface CommentDetailResponseInterface {
    data: CommentInterface;
    isSuccess: boolean;
}

export interface CommentsAnalyticsInterface {
    total_comments: number;
    with_mention: number;
    responded: number;
    no_response: number;
}

export type CommentsAnalyticsResponseInterface = CommentsAnalyticsInterface;

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

export interface CommentsContextInterface {
    comments: CommentInterface[];
    analytics: CommentsAnalyticsInterface | null;
    isLoading: boolean;
    refetch: (filters?: CommentsListFiltersInterface) => Promise<void>;
    refetchAnalytics: () => Promise<void>;
    patchCommentLocal: (comment: CommentInterface) => void;
    removeCommentLocal: (id: string) => void;
}
