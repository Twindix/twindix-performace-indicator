import { sprintsConstants } from "@/constants";
import { sprintsService } from "@/services";

import { useMutationAction } from "../shared";

export const useDeleteSprint = () => {
    const { mutate, isLoading } = useMutationAction(
        async (id: string): Promise<true> => {
            await sprintsService.deleteHandler(id);
            return true;
        },
        {
            successMessage: sprintsConstants.messages.deleteSuccess,
            errorFallback: sprintsConstants.errors.deleteFailed,
            context: "sprint.delete",
        },
    );

    return { deleteHandler: mutate, isLoading };
};
