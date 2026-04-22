import { tasksConstants } from "@/constants/tasks";
import type { TaskAttachmentInterface } from "@/interfaces";
import { tasksService } from "@/services";

import { useMutationAction, type FieldErrors } from "../shared";

export interface UseTaskAttachmentsOptions {
    onFieldErrors?: (errors: FieldErrors) => void;
}

export const useTaskAttachments = ({ onFieldErrors }: UseTaskAttachmentsOptions = {}) => {
    const { mutate: uploadHandler, isLoading: isUploading } = useMutationAction(
        async (taskId: string, file: File): Promise<TaskAttachmentInterface[]> => {
            const res = await tasksService.addAttachmentHandler(taskId, file);
            const task = (res as unknown as { data?: { attachments?: TaskAttachmentInterface[] } }).data
                ?? (res as unknown as { attachments?: TaskAttachmentInterface[] });
            return task?.attachments ?? [];
        },
        {
            successMessage: tasksConstants.messages.attachmentUploadSuccess,
            errorFallback: tasksConstants.errors.attachmentUploadFailed,
            onFieldErrors,
            context: "tasks.attachments.upload",
        },
    );

    const { mutate: deleteHandler, isLoading: isDeleting } = useMutationAction(
        async (taskId: string, attachmentId: string): Promise<true> => {
            await tasksService.removeAttachmentHandler(taskId, attachmentId);
            return true;
        },
        {
            successMessage: tasksConstants.messages.attachmentDeleteSuccess,
            errorFallback: tasksConstants.errors.attachmentDeleteFailed,
            context: "tasks.attachments.delete",
        },
    );

    return { uploadHandler, deleteHandler, isLoading: isUploading || isDeleting };
};
