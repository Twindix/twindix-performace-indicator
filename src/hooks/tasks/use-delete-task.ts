import { tasksConstants } from "@/constants/tasks";
import { tasksService } from "@/services";

import { useMutationAction } from "../shared";

export const useDeleteTask = () => {
    const { mutate, isLoading } = useMutationAction(
        async (id: string): Promise<true> => {
            await tasksService.deleteHandler(id);
            return true;
        },
        {
            successMessage: tasksConstants.messages.deleteSuccess,
            errorFallback: tasksConstants.errors.deleteFailed,
            context: "tasks.delete",
        },
    );

    return { deleteHandler: mutate, isLoading };
};
