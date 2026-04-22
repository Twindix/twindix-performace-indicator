import { redFlagsConstants } from "@/constants";
import { redFlagsService } from "@/services";

import { useMutationAction } from "../shared";

export const useDeleteRedFlag = () => {
    const { mutate, isLoading } = useMutationAction(
        async (id: string): Promise<true> => {
            await redFlagsService.deleteHandler(id);
            return true;
        },
        {
            successMessage: redFlagsConstants.messages.deleteSuccess,
            errorFallback: redFlagsConstants.errors.deleteFailed,
            context: "red-flags.delete",
        },
    );

    return { deleteHandler: mutate, isLoading };
};
