import { commentsConstants } from "@/constants";
import type { CommentInterface } from "@/interfaces";
import { commentsService } from "@/services";

import { useMutationAction } from "../shared";

export const useRespondComment = () => {
    const { mutate, isLoading } = useMutationAction(
        (id: string): Promise<CommentInterface> => commentsService.respondHandler(id),
        {
            successMessage: commentsConstants.messages.respondSuccess,
            errorFallback: commentsConstants.errors.respondFailed,
            context: "comments.respond",
        },
    );

    return { respondHandler: mutate, isLoading };
};
