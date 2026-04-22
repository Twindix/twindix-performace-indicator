import { tasksConstants } from "@/constants/tasks";
import type { TaskLiteInterface } from "@/interfaces";
import { tasksService } from "@/services";

import { useQueryAction } from "../shared";

export interface TasksListLiteParams {
    sprint_id?: string;
    status?: string;
    exclude_done?: boolean;
}

export const useTasksListLite = (params: TasksListLiteParams = {}) => {
    const { data, isLoading, refetch } = useQueryAction<TaskLiteInterface[]>(
        () => tasksService.listLiteHandler(params),
        [params.sprint_id, params.status, params.exclude_done],
        {
            errorFallback: tasksConstants.errors.fetchFailed,
            initialData: [],
            context: "tasks.listLite",
        },
    );

    return { tasks: data ?? [], isLoading, refetch };
};
