import type { TaskStatsInterface } from "@/interfaces";
import { tasksService } from "@/services";

import { useMutationAction } from "../shared";

export const useTaskStats = () => {
    const { mutate, isLoading } = useMutationAction(
        (sprintId: string): Promise<TaskStatsInterface> => tasksService.statsHandler(sprintId),
        { silent: true, context: "tasks.stats" },
    );

    return { statsHandler: mutate, isLoading };
};
