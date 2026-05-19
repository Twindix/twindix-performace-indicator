import { ganttConstants } from "@/constants";
import type { GanttApiFiltersInterface, GanttResponseInterface } from "@/interfaces";
import { ganttService } from "@/services";

import { useQueryAction } from "../shared";

export const useGanttTasks = (entityId: string, mode: "sprint" | "project" = "sprint", apiFilters?: GanttApiFiltersInterface) => {
    const { data, isLoading, refetch } = useQueryAction<GanttResponseInterface | null>(
        () => mode === "project"
            ? ganttService.byProjectHandler(entityId, apiFilters)
            : ganttService.bySprintHandler(entityId, apiFilters),
        [entityId, mode, apiFilters?.status],
        {
            enabled: !!entityId,
            errorFallback: ganttConstants.errors.fetchFailed,
            context: "gantt.tasks",
            initialData: null,
        },
    );

    return {
        sprint: data?.sprint ?? null,
        tasks: data?.tasks ?? [],
        isLoading,
        refetch,
    };
};
