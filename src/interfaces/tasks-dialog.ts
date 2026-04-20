import type { TaskPriority, TaskStatus } from "@/enums";
import type { TaskInterface, UserInterface } from "@/interfaces";

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
