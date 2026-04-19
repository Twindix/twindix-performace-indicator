import type { TaskPhase, TaskPriority, TaskStatus } from "@/enums";
import type { UserInterface } from "@/interfaces/common";

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
    reactions?: Record<string, string[]>;
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

export interface TaskKanbanResponseInterface {
    data: Record<string, TaskInterface[]>;
    isSuccess: boolean;
}

export interface TaskPipelineResponseInterface {
    data: TaskInterface[];
    isSuccess: boolean;
}

export interface TaskPipelineCountsResponseInterface {
    data: Record<string, number>;
    isSuccess: boolean;
}

export interface TaskStatsResponseInterface {
    data: {
        total: number;
        completed: number;
        inProgress: number;
        blocked: number;
    };
    isSuccess: boolean;
}

export interface TaskListResponseInterface {
    data: TaskInterface[];
    isSuccess: boolean;
}

export interface TaskDetailResponseInterface {
    data: TaskInterface;
    isSuccess: boolean;
}

export interface CreateTaskPayloadInterface {
    title: string;
    description?: string;
    assigneeIds?: string[];
    priority?: TaskPriority;
    status?: TaskStatus;
    tags?: string[];
}

export interface UpdateTaskPayloadInterface extends Partial<CreateTaskPayloadInterface> {
    phase?: TaskPhase;
    storyPoints?: number;
}

export interface UpdateTaskStatusPayloadInterface {
    status: TaskStatus;
}

export interface RequirementDraftInterface {
    id: string;
    label: string;
}

export interface AttachmentInterface {
    id: string;
    name: string;
    size: number;
    type: string;
}

export interface AddTaskFormState {
    title: string;
    description: string;
    assigneeIds: string[];
    priority: TaskPriority;
    status: TaskStatus;
    estimatedHours: number;
    attachments: AttachmentInterface[];
    initialComment: string;
    requirements: RequirementDraftInterface[];
}

export interface AddTaskDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    members: UserInterface[];
    sprintId: string;
    onAddTask: (task: TaskInterface) => void;
}

export interface TasksContextInterface {
    tasks: TaskInterface[];
    isLoading: boolean;
    createTask: (payload: CreateTaskPayloadInterface) => Promise<TaskInterface | null>;
    updateTask: (id: string, payload: UpdateTaskPayloadInterface) => Promise<TaskInterface | null>;
    fetchTaskDetail: (id: string) => Promise<TaskInterface | null>;
    uploadAttachment: (taskId: string, file: File) => Promise<TaskInterface | null>;
    removeAttachment: (taskId: string, attachmentId: string) => Promise<void>;
    patchTaskLocal: (id: string, updates: Partial<TaskInterface>) => void;
}
