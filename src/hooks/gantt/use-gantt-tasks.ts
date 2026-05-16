import { ganttConstants } from "@/constants";
import type { GanttApiFiltersInterface, GanttResponseInterface } from "@/interfaces";
import { ganttService } from "@/services";

import { useQueryAction } from "../shared";

export const useGanttTasks = (filters?: GanttApiFiltersInterface) => {
    const { project_id, status, from, to } = filters ?? {};

    const { data, isLoading, refetch } = useQueryAction<GanttResponseInterface | null>(
        () => ganttService.tasksHandler({ project_id, status, from, to }),
        [project_id, status, from, to],
        {
            errorFallback: ganttConstants.errors.fetchFailed,
            context: "gantt.tasks",
            initialData: null,
        },
    );

    return {
        summary: data?.summary ?? null,
        tasks: data?.tasks ?? [],
        isLoading,
        refetch,
    };
};
