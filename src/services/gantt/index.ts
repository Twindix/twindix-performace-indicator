import { apisData } from "@/data";
import type { GanttApiFiltersInterface, GanttResponseInterface } from "@/interfaces";
import { apiClient } from "@/lib/axios";

export const ganttService = {
    tasksHandler: async (filters?: GanttApiFiltersInterface): Promise<GanttResponseInterface> => {
        const { data } = await apiClient.get<GanttResponseInterface>(apisData.gantt.tasks, {
            params: filters,
        });
        return data;
    },
};
