import { blockersConstants } from "@/constants";
import { blockersService } from "@/services";

import { useMutationAction } from "../shared";

export const useDeleteBlocker = () => {
    const { mutate, isLoading } = useMutationAction(
        async (id: string): Promise<true> => {
            await blockersService.deleteHandler(id);
            return true;
        },
        {
            successMessage: blockersConstants.messages.deleteSuccess,
            errorFallback: blockersConstants.errors.deleteFailed,
            context: "blockers.delete",
        },
    );

    return { deleteHandler: mutate, isLoading };
};
