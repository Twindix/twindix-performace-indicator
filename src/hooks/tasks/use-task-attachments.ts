import { useCallback, useState } from "react";
import { toast } from "sonner";

import { tasksConstants } from "@/constants/tasks";
import type { TaskAttachmentInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { tasksService } from "@/services";

export const useTaskAttachments = () => {
    const [isLoading, setIsLoading] = useState(false);

    const uploadHandler = useCallback(async (taskId: string, file: File): Promise<TaskAttachmentInterface[] | null> => {
        setIsLoading(true);
        try {
            const res = await tasksService.addAttachmentHandler(taskId, file);
            const task = (res as unknown as { data?: { attachments?: TaskAttachmentInterface[] } }).data
                ?? (res as unknown as { attachments?: TaskAttachmentInterface[] });
            toast.success(tasksConstants.messages.attachmentUploadSuccess);
            return task?.attachments ?? [];
        } catch (err) {
            toast.error(getErrorMessage(err, tasksConstants.errors.attachmentUploadFailed));
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const deleteHandler = useCallback(async (taskId: string, attachmentId: string): Promise<boolean> => {
        setIsLoading(true);
        try {
            await tasksService.removeAttachmentHandler(taskId, attachmentId);
            toast.success(tasksConstants.messages.attachmentDeleteSuccess);
            return true;
        } catch (err) {
            toast.error(getErrorMessage(err, tasksConstants.errors.attachmentDeleteFailed));
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { uploadHandler, deleteHandler, isLoading };
};