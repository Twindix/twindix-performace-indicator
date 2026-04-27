import type { TaskPriority } from "@/enums";

import type { TaskInterface } from "./domain";

// === Form draft types (formerly in interfaces/tasks-dialog.ts) ===

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
    assigned_to: string;
    priority: TaskPriority;
    estimatedHours: number;
    attachments: AttachmentInterface[];
    files: File[];
    tags: string[];
    requirements: RequirementDraftInterface[];
}

export interface AddTaskDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    members: import("@/interfaces/users").UserLiteInterface[];
    sprintId: string;
    onAddTask?: (task: TaskInterface) => void;
    addTaskLocal?: (task: TaskInterface) => void;
}

// === Transition rule result (used by lib/tasks/check-transition) ===

export interface TransitionCriterionResultInterface {
    label: string;
    met: boolean;
}

export interface TransitionResultInterface {
    allowed: boolean;
    reason: string;
    criteria: TransitionCriterionResultInterface[];
}

// === View shared groupings ===

import type { KanbanBoardInterface, PipelineBoardInterface } from "./domain";
import type { UserLiteInterface } from "@/interfaces/users";

export interface TasksListFiltersInterface {
    status?: string;
    assigned_to?: string;
    priority?: string;
    type?: string;
    search?: string;
    per_page?: number;
    sort_by?: string;
    sort_order?: string;
}

export interface TasksFiltersValuesInterface {
    status: string;
    priority: string;
    assignee: string;
    type: string;
}

export type TasksViewMode = "board" | "pipeline";

export interface TasksStatsInterface {
    total: number;
    donePoints: number;
    totalPoints: number;
    blocked: number;
}

export interface TasksSearchControlInterface {
    value: string;
    onChange: (v: string) => void;
}

export interface TasksFiltersControlInterface {
    values: TasksFiltersValuesInterface;
    onChange: (key: keyof TasksFiltersValuesInterface, value: string) => void;
    onClear: () => void;
}

export interface TasksViewModeControlInterface {
    value: TasksViewMode;
    onChange: (v: TasksViewMode) => void;
}

export interface TasksTransitionStateInterface {
    isOpen: boolean;
    task: TaskInterface | null;
    targetPhase: string | null;
    open: (task: TaskInterface, targetPhase: string) => void;
    close: () => void;
}

// === Component prop interfaces ===

export interface TasksHeaderActionsInterface {
    canCreate: boolean;
    onCreate: () => void;
    hasFiltersOrTasks: boolean;
    stats: TasksStatsInterface;
}

export interface TasksHeaderPropsInterface {
    actions: TasksHeaderActionsInterface;
}

export interface TasksFiltersPropsInterface {
    search: TasksSearchControlInterface;
    filters: TasksFiltersControlInterface;
    viewMode: TasksViewModeControlInterface;
    users: UserLiteInterface[];
    canCreate: boolean;
    onCreate: () => void;
}

export interface ViewModeTogglePropsInterface {
    value: TasksViewMode;
    onChange: (v: TasksViewMode) => void;
}

export interface TasksContentPropsInterface {
    viewMode: TasksViewMode;
    kanban: KanbanBoardInterface;
    pipeline: PipelineBoardInterface;
    isEmpty: boolean;
    onSelectTask: (task: TaskInterface) => void;
}

export interface BoardViewPropsInterface {
    kanban: KanbanBoardInterface;
    onSelectTask: (task: TaskInterface) => void;
}

export interface BoardColumnPropsInterface {
    status: string;
    label: string;
    tasks: TaskInterface[];
    onSelectTask: (task: TaskInterface) => void;
}

export interface TaskKanbanCardPropsInterface {
    task: TaskInterface;
    onClick: () => void;
}

export interface PipelineViewPropsInterface {
    pipeline: PipelineBoardInterface;
    onSelectTask: (task: TaskInterface) => void;
}

export interface PipelineColumnPropsInterface {
    columnKey: string;
    tasks: TaskInterface[];
    onSelectTask: (task: TaskInterface) => void;
}

export interface TaskPipelineCardPropsInterface {
    task: TaskInterface;
    onClick: () => void;
}

// === Hook arg / return types ===

import type { Dispatch, SetStateAction } from "react";

export interface UseTasksFiltersReturnInterface {
    search: string;
    debouncedSearch: string;
    setSearch: (v: string) => void;
    values: TasksFiltersValuesInterface;
    onChange: (key: keyof TasksFiltersValuesInterface, value: string) => void;
    onClear: () => void;
    isAnyApplied: boolean;
}

export interface UseTasksDialogsArgsInterface {
    onTaskFetch: (taskId: string) => Promise<TaskInterface | null>;
    onPatchTask: (task: TaskInterface) => void;
}

export interface UseTasksDialogsReturnInterface {
    selectedTask: TaskInterface | null;
    setSelectedTask: Dispatch<SetStateAction<TaskInterface | null>>;
    detailOpen: boolean;
    setDetailOpen: Dispatch<SetStateAction<boolean>>;
    addOpen: boolean;
    openAdd: () => void;
    closeAdd: () => void;
    transition: TasksTransitionStateInterface;
}

// === Detail dialog types ===

import type { TaskPhase } from "@/enums";
import type {
    BlockerInterface,
    RequirementInterface,
    TaskCommentInterface,
} from "@/interfaces";

export interface UseTaskDetailArgsInterface {
    task: TaskInterface | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    patchTaskLocal: (id: string, updates: Partial<TaskInterface>) => void;
    removeTaskLocal: (id: string) => void;
}

export interface UseTaskDetailReturnInterface {
    confirmDelete: boolean;
    setConfirmDelete: Dispatch<SetStateAction<boolean>>;
    isDeletingTask: boolean;
    isMarkingComplete: boolean;
    handleDelete: () => Promise<void>;
    handleMarkComplete: () => Promise<void>;
    isFetchingRequirements: boolean;
}

export interface UseTaskTagsFormArgsInterface {
    task: TaskInterface;
    patchTaskLocal: (id: string, updates: Partial<TaskInterface>) => void;
}

export interface UseTaskTagsFormReturnInterface {
    tagInput: string;
    setTagInput: Dispatch<SetStateAction<string>>;
    showTagInput: boolean;
    setShowTagInput: Dispatch<SetStateAction<boolean>>;
    handleAddTag: () => Promise<void>;
    handleRemoveTag: (tagId: string) => Promise<void>;
}

export interface UseTaskRequirementsFormArgsInterface {
    task: TaskInterface;
    patchTaskLocal: (id: string, updates: Partial<TaskInterface>) => void;
}

export interface UseTaskRequirementsFormReturnInterface {
    reqInput: string;
    setReqInput: Dispatch<SetStateAction<string>>;
    showReqInput: boolean;
    setShowReqInput: Dispatch<SetStateAction<boolean>>;
    editingReqId: string | null;
    setEditingReqId: Dispatch<SetStateAction<string | null>>;
    editingReqLabel: string;
    setEditingReqLabel: Dispatch<SetStateAction<string>>;
    isAddingReq: boolean;
    handleAdd: () => Promise<void>;
    handleSaveEdit: (req: RequirementInterface) => Promise<void>;
    handleToggle: (req: RequirementInterface) => Promise<void>;
    handleDelete: (reqId: string) => Promise<void>;
}

export interface TaskDetailDialogPropsInterface {
    task: TaskInterface | null;
    members: UserLiteInterface[];
    blocker: BlockerInterface | undefined;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onMoveRequest: (task: TaskInterface, targetPhase: TaskPhase) => void;
    patchTaskLocal: (id: string, updates: Partial<TaskInterface>) => void;
    removeTaskLocal: (id: string) => void;
}

export interface TaskDetailHeaderPropsInterface {
    task: TaskInterface;
    canDelete: boolean;
    onRequestDelete: () => void;
}

export interface TaskPhaseNavigationPropsInterface {
    task: TaskInterface;
    canFinish: boolean;
    canMove: boolean;
    isMarkingComplete: boolean;
    onMarkComplete: () => void;
    onMoveNext: (target: TaskPhase) => void;
}

export interface TaskMetaGridPropsInterface {
    task: TaskInterface;
}

export interface TaskTagsSectionPropsInterface {
    task: TaskInterface;
    canEdit: boolean;
    patchTaskLocal: (id: string, updates: Partial<TaskInterface>) => void;
}

export interface TaskBlockerSectionPropsInterface {
    blocker: BlockerInterface | undefined;
    isBlocked: boolean;
}

export interface TaskRequirementsSectionPropsInterface {
    task: TaskInterface;
    canToggleRequirement: boolean;
    isFetching: boolean;
    patchTaskLocal: (id: string, updates: Partial<TaskInterface>) => void;
}

export interface TaskRequirementItemPropsInterface {
    req: RequirementInterface;
    canToggle: boolean;
    onToggle: () => void;
    onStartEdit: () => void;
    onDelete: () => void;
}

export interface TaskAttachmentsSectionPropsInterface {
    task: TaskInterface;
    patchTaskLocal: (id: string, updates: Partial<TaskInterface>) => void;
}

export interface TaskTimeLogsSectionPropsInterface {
    task: TaskInterface;
    members: UserLiteInterface[];
    patchTaskLocal: (id: string, updates: Partial<TaskInterface>) => void;
}

export interface TaskCommentsSectionPropsInterface {
    task: TaskInterface;
    currentUserId: string;
    members: UserLiteInterface[];
    onUpdateComments?: (taskId: string, comments: TaskCommentInterface[]) => void;
}

export interface MentionDropdownPropsInterface {
    members: UserLiteInterface[];
    activeIndex: number;
    onSelect: (user: UserLiteInterface) => void;
}

export interface DeleteTaskConfirmDialogPropsInterface {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    taskTitle: string;
    isDeleting: boolean;
    onConfirm: () => void;
}

export interface UseTasksViewReturnInterface {
    permissions: import("@/hooks/shared/use-permissions").Permissions;
    activeSprintId: string;
    currentUserId: string;
    users: UserLiteInterface[];
    isLoading: boolean;
    isEmpty: boolean;
    tasks: TaskInterface[];
    kanban: KanbanBoardInterface;
    pipeline: PipelineBoardInterface;
    stats: TasksStatsInterface;
    filters: UseTasksFiltersReturnInterface;
    dialogs: UseTasksDialogsReturnInterface;
    viewMode: TasksViewModeControlInterface;
    patchTaskLocal: (task: TaskInterface) => void;
    removeTaskLocal: (id: string) => void;
    addTaskLocal: (task: TaskInterface) => void;
    refetch: () => unknown;
    onConfirmTransition: () => Promise<void>;
    isUpdatingStatus: boolean;
}
