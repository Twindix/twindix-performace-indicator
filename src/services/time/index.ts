import { apisData } from "@/data";
import type {
    SprintTimeTrackingResponseInterface,
    TaskTimeTrackingResponseInterface,
    TimeByUserInterface,
    UserTimeTrackingResponseInterface,
} from "@/interfaces";
import { apiClient } from "@/lib/axios";

const normalizeByUser = (u: any): TimeByUserInterface => ({
    user_id: u.user_id,
    name: u.name ?? u.user_name ?? "",
    total_logged_hours: u.total_logged_hours ?? u.total_hours ?? 0,
});

export const timeService = {
    bySprintHandler: async (sprintId: string): Promise<SprintTimeTrackingResponseInterface> => {
        const { data } = await apiClient.get<{ data: any }>(apisData.time.bySprint(sprintId));
        const raw = data.data;
        return {
            sprint_id: raw.sprint_id,
            total_estimated_hours: raw.total_estimated_hours ?? 0,
            total_logged_hours: raw.total_logged_hours ?? 0,
            variance_hours: raw.variance_hours ?? 0,
            by_user: (raw.by_user ?? []).map(normalizeByUser),
        };
    },

    byUserHandler: async (userId: string): Promise<UserTimeTrackingResponseInterface> => {
        const { data } = await apiClient.get<{ data: any }>(apisData.time.byUser(userId));
        const raw = data.data;
        return {
            user_id: raw.user_id,
            total_logged_hours: raw.total_logged_hours ?? 0,
            by_day: raw.by_day ?? [],
        };
    },

    byTaskHandler: async (taskId: string): Promise<TaskTimeTrackingResponseInterface> => {
        const { data } = await apiClient.get<{ data: any }>(apisData.time.byTask(taskId));
        const raw = data.data;
        return {
            task_id: raw.task_id,
            total_logged_hours: raw.total_logged_hours ?? 0,
            by_user: (raw.by_user ?? []).map(normalizeByUser),
        };
    },
};
