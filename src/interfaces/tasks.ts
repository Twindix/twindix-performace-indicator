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

export interface TaskCommentInterface {
    id: string;
    authorId: string;
    content: string;
    mentionedId?: string;
    createdAt: string;
    updatedAt?: string;
    reactions?: Record<string, string[]>; // emoji -> userIds[]
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
