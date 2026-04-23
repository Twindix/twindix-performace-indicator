import { tasksConstants } from "@/constants/tasks";
import { tasksService } from "@/services";

import { useMutationAction } from "../shared";

export const useUpdateTaskStatus = () => {
    const { mutate, isLoading } = useMutationAction(
        async (id: string, status: string): Promise<true> => {
            await tasksService.updateStatusHandler(id, { status });
            return true;
        },
        {
            successMessage: tasksConstants.messages.updateSuccess,
            errorFallback: tasksConstants.errors.updateFailed,
            context: "tasks.updateStatus",
        },
    );

    return { updateStatusHandler: mutate, isLoading };
};
