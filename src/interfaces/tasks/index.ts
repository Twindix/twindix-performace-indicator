export interface TaskUserInterface {
    id: string;
    full_name: string;
    avatar_initials: string;
}

export interface TaskTagInterface {
    id: string;
    tag: string;
}

// Allow tags to be either strings or TaskTagInterface objects for flexibility
export type TaskTag = string | TaskTagInterface;

export interface TaskCommentInterface {
    id: string;
    body: string;
    author: TaskUserInterface;
    mentioned_users: { id: string; full_name: string }[];
    response_status: string;
    responded_by: TaskUserInterface | null;
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

export interface TaskPhaseNavigationInterface {
    previous: string | null;
    current: string | null;
    next: string | null;
}

export interface TaskInterface {
    id: string;
    task_number?: string;
    title: string;
    description: string | null;
    priority: string;
    status?: string | null;
    tracking_status?: string | null;
    type?: string | null;
    story_points?: number | null;
    estimated_hours?: number | null;
    stages_completed?: string | null;
    stages_total?: string | null;
    rework_count?: string | null;
    is_blocked?: boolean | null;
    is_overdue?: boolean | null;
    pending_approval?: boolean | null;
    created_at?: string;
    assignee?: TaskUserInterface | null;
    tags: TaskTag[];
    requirements?: RequirementInterface[];
    attachments?: TaskAttachmentInterface[];
    phase_navigation?: TaskPhaseNavigationInterface;
    // Additional properties expected by the code
    phase?: string;
    hasBlocker?: boolean;
    assigneeIds?: string[];
    storyPoints?: number;
    createdAt?: string;
    updatedAt?: string;
    comments?: TaskCommentInterface[];
    timeLogs?: TimeLogInterface[];
    readinessScore?: number;
    sprintId?: string;
    blockerId?: string;
    workType?: string;
    readinessChecklist?: Record<string, boolean>;
}

export interface TaskAttachmentInterface {
    id: string;
    name: string;
    size: number;
    type: string;
    url: string;
    uploaded_at?: string;
    uploadedAt?: string; // Alternative property name expected by the code
    dataUrl?: string; // Expected by the code
}

export interface TaskLiteInterface {
    id: string;
    code?: string;
    title: string;
}

export interface RequirementInterface {
    id: string;
    content: string;
    is_done: boolean | null;
    completed_at: string | null;
    completed_by?: TaskUserInterface;
    sort_order: string | null;
    // Additional properties expected by the code
    label?: string;
    met?: boolean;
}

export interface TimeLogInterface {
    id: string;
    task_id: string;
    user: TaskUserInterface;
    hours: number;
    description: string | null;
    logged_date: string;
    created_at: string;
    // Additional properties expected by the code
    user_id?: string;
    date?: string;
}

export interface TimeLogsSummaryInterface {
    total_hours: number;
    total_logs: number;
    average_hours_per_day: number;
    total_entries?: number; // Additional property expected by the code
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

export interface TaskStatsInterface {
    total_tasks: number;
    story_points: { used: number; total: number };
    blocked_count: number;
}

export interface TransitionCriteriaItemInterface {
    label: string;
    passed: boolean;
}

export interface TransitionCriteriaResponseInterface {
    task: { id: string; title: string; priority: string; story_points: number | null };
    transition: { from: string | null; to: string; direction: "forward" | "backward" };
    criteria: TransitionCriteriaItemInterface[];
    all_passed: boolean;
}

export type KanbanBoardInterface = Record<string, TaskInterface[]>;
export type PipelineBoardInterface = Record<string, TaskInterface[]>;

export interface TaskListMetaInterface {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export interface TaskListResponseInterface {
    data: TaskInterface[];
    meta: TaskListMetaInterface;
}

export interface TaskDetailResponseInterface {
    data: TaskInterface;
}

export interface CreateTaskPayloadInterface {
    title: string;
    description?: string;
    assigned_to: string;
    priority?: string;
    status?: string;
    story_points?: number;
    estimated_hours: number;
    assigneeIds?: string[]; // Additional property expected by the code
    tags?: TaskTag[]; // Additional property expected by the code
}

export interface UpdateTaskPayloadInterface {
    title?: string;
    description?: string;
    assigned_to?: string;
    priority?: string;
    story_points?: number;
    estimated_hours?: number;
    phase?: string; // Additional property expected by the code
}

export interface UpdateTaskStatusPayloadInterface {
    status: string;
}

export interface CreateRequirementPayloadInterface {
    content?: string;
    label?: string; // Additional property expected by the code
}

export interface UpdateRequirementPayloadInterface {
    content?: string;
    label?: string; // Additional property expected by the code
}

export interface CreateTimeLogPayloadInterface {
    hours: number;
    logged_date?: string;
    description?: string;
    date?: string; // Additional property expected by the code
}

export interface UpdateTimeLogPayloadInterface {
    hours?: number;
    logged_date?: string;
    description?: string;
}
