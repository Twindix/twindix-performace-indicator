import { useState } from "react";

import { meetingsConstants } from "@/constants";
import type { ApiMeetingCommentInterface } from "@/interfaces";
import { runAction } from "@/lib/handle-action";
import { meetingsService } from "@/services";

export const useCreateMeetingComment = () => {
    const [isLoading, setIsLoading] = useState(false);

    const createHandler = async (meetingId: string, body: string): Promise<ApiMeetingCommentInterface | null> => {
        setIsLoading(true);
        try {
            return await runAction(() => meetingsService.commentCreateHandler(meetingId, { body }), {
                errorFallback: meetingsConstants.errors.commentFailed,
                successMessage: meetingsConstants.messages.commentSuccess,
                context: "meetings.comment.create",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return { createHandler, isLoading };
};

export const useDeleteMeetingComment = () => {
    const [isLoading, setIsLoading] = useState(false);

    const deleteHandler = async (meetingId: string, commentId: string): Promise<boolean> => {
        setIsLoading(true);
        try {
            const ok = await runAction(async () => {
                await meetingsService.commentDeleteHandler(meetingId, commentId);
                return true;
            }, {
                errorFallback: meetingsConstants.errors.commentFailed,
                context: "meetings.comment.delete",
            });
            return ok ?? false;
        } finally {
            setIsLoading(false);
        }
    };

    return { deleteHandler, isLoading };
};
