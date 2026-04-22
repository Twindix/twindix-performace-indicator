import { decisionsConstants } from "@/constants";
import { decisionsService } from "@/services";

import { useMutationAction } from "../shared";

export const useDeleteDecision = () => {
    const { mutate, isLoading } = useMutationAction(
        async (id: string): Promise<true> => {
            await decisionsService.deleteHandler(id);
            return true;
        },
        {
            successMessage: decisionsConstants.messages.deleteSuccess,
            errorFallback: decisionsConstants.errors.deleteFailed,
            context: "decisions.delete",
        },
    );

    return { deleteHandler: mutate, isLoading };
};
