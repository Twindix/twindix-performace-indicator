import { useCallback, useState } from "react";
import { toast } from "sonner";

import { tasksConstants } from "@/constants/tasks";
import type { TaskAttachmentInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { tasksService } from "@/services";

export const useTaskAttachments = () => {
    const [isLoading, setIsLoading] = useState(false);

    const uploadHandler = useCallback(async (taskId: string, file: File): Promise<TaskAttachmentInterface | null> => {
        setIsLoading(true);
        try {
            const res = await tasksService.addAttachmentHandler(taskId, file);
            toast.success(tasksConstants.messages.attachmentUploadSuccess);
            return res.data.attachments?.[0] || null; // Return the new attachment from the response
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