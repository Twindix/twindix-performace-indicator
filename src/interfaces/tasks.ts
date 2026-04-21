import type { TaskPhase, TaskPriority, TaskStatus } from "@/enums";

export interface RequirementInterface {
    id: string;
    label: string;
    met: boolean;
}

export interface ReadinessChecklistInterface {
    acceptanceCriteriaDefined: boolean;
    businessRulesClear: boolean;
    edgeCasesIdentified: boolean;
    dependenciesMapped: boolean;
    designAvailable: boolean;
    apiContractReady: boolean;
    estimationDone: boolean;
}

export interface TaskAttachmentInterface {
    id: string;
    name: string;
    size: number;
    type: string;
    dataUrl: string;
    uploadedAt: string;
}

export interface TaskCommentAuthorInterface {
    id: string;
    full_name: string;
    avatar_initials: string;
}

export interface TaskCommentInterface {
    id: string;
    body: string;
    author: TaskCommentAuthorInterface;
    mentioned_users: { id: string; full_name: string }[];
    response_status: string;
    responded_by: TaskCommentAuthorInterface | null;
    responded_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface CommentListResponseInterface {
    data: TaskCommentInterface[];
    count: number;
}

export interface CreateCommentPayloadInterface {
    body: string;
    mentioned_user_ids?: string[];
}

export interface UpdateCommentPayloadInterface {
    body: string;
    mentioned_user_ids?: string[];
}

export interface TaskTimeLogInterface {
    id: string;
    userId: string;
    phase: TaskPhase;
    hours: number;
    description: string;
    createdAt: string;
}

export interface TaskInterface {
    id: string;
    title: string;
    description: string;
    assigneeIds: string[];
    phase: TaskPhase;
    priority: TaskPriority;
    storyPoints: number;
    sprintId: string;
    readinessScore: number;
    readinessChecklist: ReadinessChecklistInterface;
    hasBlocker: boolean;
    blockerId?: string;
    createdAt: string;
    updatedAt: string;
    tags: string[];
    type?: "feature" | "bug";
    status?: TaskStatus;
    requirements?: RequirementInterface[];
    attachments?: TaskAttachmentInterface[];
    comments?: TaskCommentInterface[];
    timeLogs?: TaskTimeLogInterface[];
    workType: "Design" | "Frontend" | "Backend" | "QA" | "Done";
}
