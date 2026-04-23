import { tasksConstants } from "@/constants/tasks";
import type { TaskInterface } from "@/interfaces";
import { tasksService } from "@/services";

import { useMutationAction } from "../shared";

export const useMarkTaskComplete = () => {
    const { mutate, isLoading } = useMutationAction(
        async (id: string): Promise<TaskInterface> => tasksService.markCompleteHandler(id),
        {
            successMessage: tasksConstants.messages.markCompleteSuccess,
            errorFallback: tasksConstants.errors.markCompleteFailed,
            context: "tasks.markComplete",
        },
    );

    return { markCompleteHandler: mutate, isLoading };
};
