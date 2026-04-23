import { commentsConstants } from "@/constants";
import type { CommentInterface, UpdateCommentPayloadInterface } from "@/interfaces";
import { commentsService } from "@/services";

import { useMutationAction, type FieldErrors } from "../shared";

export interface UseUpdateCommentOptions {
    onFieldErrors?: (errors: FieldErrors) => void;
}

export const useUpdateComment = ({ onFieldErrors }: UseUpdateCommentOptions = {}) => {
    const { mutate, isLoading } = useMutationAction(
        (id: string, payload: UpdateCommentPayloadInterface): Promise<CommentInterface> =>
            commentsService.updateHandler(id, payload),
        {
            successMessage: commentsConstants.messages.updateSuccess,
            errorFallback: commentsConstants.errors.updateFailed,
            onFieldErrors,
            context: "comments.update",
        },
    );

    return { updateHandler: mutate, isLoading };
};
