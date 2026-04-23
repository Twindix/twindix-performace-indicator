import { tasksConstants } from "@/constants/tasks";
import type { TaskInterface } from "@/interfaces";
import { tasksService } from "@/services";

import { useMutationAction } from "../shared";

export const useGetTask = () => {
    const { mutate, isLoading } = useMutationAction(
        async (id: string): Promise<TaskInterface> => {
            const res = await tasksService.detailHandler(id);
            return (res as unknown as { data?: TaskInterface }).data ?? (res as unknown as TaskInterface);
        },
        {
            errorFallback: tasksConstants.errors.fetchFailed,
            context: "tasks.detail",
        },
    );

    return { getHandler: mutate, isLoading };
};
