import { useState } from "react";

import { meetingsConstants } from "@/constants";
import type { ApiMeetingAttachmentInterface } from "@/interfaces";
import { runAction } from "@/lib/handle-action";
import { meetingsService } from "@/services";

export const useUploadMeetingAttachment = () => {
    const [isLoading, setIsLoading] = useState(false);

    const uploadHandler = async (meetingId: string, file: File): Promise<ApiMeetingAttachmentInterface | null> => {
        setIsLoading(true);
        try {
            return await runAction(() => meetingsService.uploadAttachmentHandler(meetingId, file), {
                errorFallback: meetingsConstants.errors.attachmentFailed,
                successMessage: meetingsConstants.messages.attachmentSuccess,
                context: "meetings.attachment.upload",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return { uploadHandler, isLoading };
};

export const useDeleteMeetingAttachment = () => {
    const [isLoading, setIsLoading] = useState(false);

    const deleteHandler = async (meetingId: string, attachmentId: string): Promise<boolean> => {
        setIsLoading(true);
        try {
            const ok = await runAction(async () => {
                await meetingsService.attachmentDeleteHandler(meetingId, attachmentId);
                return true;
            }, {
                errorFallback: meetingsConstants.errors.attachmentFailed,
                context: "meetings.attachment.delete",
            });
            return ok ?? false;
        } finally {
            setIsLoading(false);
        }
    };

    return { deleteHandler, isLoading };
};
