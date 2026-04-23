import type { TaskPriority } from "@/enums";
import type { TaskInterface, UserLiteInterface } from "@/interfaces";

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
    members: UserLiteInterface[];
    sprintId: string;
    onAddTask?: (task: TaskInterface) => void;
    addTaskLocal?: (task: TaskInterface) => void;
}
