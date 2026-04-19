import { useState } from "react";
import { toast } from "sonner";

import { tasksConstants } from "@/constants";
import type { TaskInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { tasksService } from "@/services";

export const useTaskAttachments = () => {
    const [isLoading, setIsLoading] = useState(false);

    const uploadHandler = async (taskId: string, file: File): Promise<TaskInterface | null> => {
        if (!navigator.onLine) throw new Error(tasksConstants.errors.genericError);
        setIsLoading(true);
        try {
            const res = await tasksService.addAttachmentHandler(taskId, file);
            toast.success(tasksConstants.messages.attachmentUploadSuccess);
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, tasksConstants.errors.attachmentUploadFailed));
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const deleteHandler = async (taskId: string, attachmentId: string): Promise<boolean> => {
        if (!navigator.onLine) throw new Error(tasksConstants.errors.genericError);
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
    };

    return { uploadHandler, deleteHandler, isLoading };
};
