import { sprintsConstants } from "@/constants";
import { sprintsService } from "@/services";

import { useMutationAction } from "../shared";
import { invalidateProjectSprintsCache } from "../projects/use-project-sprints";

export const useDeleteSprint = () => {
    const { mutate, isLoading } = useMutationAction(
        async (id: string): Promise<true> => {
            await sprintsService.deleteHandler(id);
            invalidateProjectSprintsCache();
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
