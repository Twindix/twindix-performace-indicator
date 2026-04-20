export interface CommentInterface {
    id: string;
    taskId: string;
    taskTitle: string;
    authorId: string;
    mentionedId?: string;
    content: string;
    createdAt: string;
    hasResponse: boolean;
    responseAt?: string;
    responderId?: string;
    sprintId: string;
}
