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
    mentions: CommentUserInterface[];
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
