import { commentsConstants } from "@/constants";
import { commentsService } from "@/services";

import { useMutationAction } from "../shared";

export const useDeleteComment = () => {
    const { mutate, isLoading } = useMutationAction(
        async (id: string): Promise<true> => {
            await commentsService.deleteHandler(id);
            return true;
        },
        {
            successMessage: commentsConstants.messages.deleteSuccess,
            errorFallback: commentsConstants.errors.deleteFailed,
            context: "comments.delete",
        },
    );

    return { deleteHandler: mutate, isLoading };
};
