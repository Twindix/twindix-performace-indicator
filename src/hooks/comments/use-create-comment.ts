import { commentsConstants } from "@/constants";
import type { CommentInterface, CreateCommentPayloadInterface } from "@/interfaces";
import { commentsService } from "@/services";

import { useMutationAction, type FieldErrors } from "../shared";

export interface UseCreateCommentOptions {
    onFieldErrors?: (errors: FieldErrors) => void;
}

export const useCreateComment = ({ onFieldErrors }: UseCreateCommentOptions = {}) => {
    const { mutate, isLoading } = useMutationAction(
        (sprintId: string, payload: CreateCommentPayloadInterface): Promise<CommentInterface> =>
            commentsService.createHandler(sprintId, payload),
        {
            successMessage: commentsConstants.messages.createSuccess,
            errorFallback: commentsConstants.errors.createFailed,
            onFieldErrors,
            context: "comments.create",
        },
    );

    return { createHandler: mutate, isLoading };
};
