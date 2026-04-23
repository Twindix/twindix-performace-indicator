import { commentsConstants } from "@/constants";
import type { CommentInterface, CreateCommentPayloadInterface } from "@/interfaces";
import { commentsService } from "@/services";

import { useMutationAction, type FieldErrors } from "../shared";

export interface UseCreateTaskCommentOptions {
    onFieldErrors?: (errors: FieldErrors) => void;
}

export const useCreateTaskComment = ({ onFieldErrors }: UseCreateTaskCommentOptions = {}) => {
    const { mutate, isLoading } = useMutationAction(
        (taskId: string, payload: CreateCommentPayloadInterface): Promise<CommentInterface> =>
            commentsService.createOnTaskHandler(taskId, payload),
        {
            errorFallback: commentsConstants.errors.createFailed,
            onFieldErrors,
            context: "comments.create-on-task",
        },
    );

    return { createOnTaskHandler: mutate, isLoading };
};
