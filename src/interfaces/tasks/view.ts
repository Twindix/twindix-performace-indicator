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
