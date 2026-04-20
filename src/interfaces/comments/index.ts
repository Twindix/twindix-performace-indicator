export interface CommentInterface {
    id: string;
    taskId: string;
    taskTitle: string;
    authorId: string;
    mentionedId?: string;
    mentioned_user_ids?: string[];
    content: string;
    body?: string;
    createdAt: string;
    hasResponse: boolean;
    responseAt?: string;
    responderId?: string;
    response_status?: string;
    sprintId: string;
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

export interface CommentsAnalyticsResponseInterface {
    data: CommentsAnalyticsInterface;
    isSuccess: boolean;
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

