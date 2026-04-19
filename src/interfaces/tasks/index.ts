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

export type TaskKanbanResponseInterface = Record<string, TaskInterface[]>;

export type TaskPipelineResponseInterface = Record<string, TaskInterface[]>;

export type TaskPipelineCountsResponseInterface = Record<string, number>;

export type TaskStatsResponseInterface = TaskStatsInterface;

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
}

export interface TaskStatsInterface {
    total_tasks: number;
    story_points: { used: number; total: number };
    blocked_count: number;
}

export interface TasksContextInterface {
    tasks: TaskInterface[];
    kanban: Record<string, TaskInterface[]>;
    pipeline: TaskInterface[];
    pipelineCounts: Record<string, number>;
    stats: TaskStatsInterface | null;
    isLoading: boolean;
    refetchKanban: () => Promise<void>;
    refetchPipeline: () => Promise<void>;
    refetchPipelineCounts: () => Promise<void>;
    refetchStats: () => Promise<void>;
    patchTaskLocal: (id: string, updates: Partial<TaskInterface>) => void;
    addTaskLocal: (task: TaskInterface) => void;
    removeTaskLocal: (id: string) => void;
    setKanbanLocal: (data: Record<string, TaskInterface[]>) => void;
    setPipelineLocal: (data: TaskInterface[]) => void;
}
