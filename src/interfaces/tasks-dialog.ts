import type { TaskPriority } from "@/enums";
import type { TaskInterface, UserInterface } from "@/interfaces";

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
    estimatedHours: number;
    attachments: AttachmentInterface[];
    initialComment: string;
}

export interface AddTaskDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    members: UserInterface[];
    sprintId: string;
    onAddTask: (task: TaskInterface) => void;
}
