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
