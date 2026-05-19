import { apisData } from "@/data";
import type { WorkloadUserRowInterface } from "@/interfaces";
import { apiClient } from "@/lib/axios";

const normalizeWorkloadUser = (u: any): WorkloadUserRowInterface => ({
    user: { id: u.user_id, name: u.user_name ?? u.name ?? "" },
    total_tasks: u.total_tasks ?? 0,
    completed_tasks: u.completed_tasks ?? 0,
    in_progress_tasks: u.in_progress_tasks ?? 0,
    blocked_tasks: u.blocked_tasks ?? 0,
    total_story_points: u.story_points ?? u.total_story_points ?? 0,
    completed_story_points: u.completed_story_points ?? 0,
    total_estimated_hours: u.estimated_hours ?? u.total_estimated_hours ?? 0,
    logged_hours: u.logged_hours ?? 0,
});

const extractRows = (raw: any): WorkloadUserRowInterface[] => {
    const inner = raw?.data ?? raw;
    const users = inner?.by_user ?? inner?.data ?? (Array.isArray(inner) ? inner : []);
    return users.map(normalizeWorkloadUser);
};

export const workloadService = {
    byProjectHandler: async (projectId: string): Promise<WorkloadUserRowInterface[]> => {
        if (!projectId) throw new Error("Project ID is required");
        const { data } = await apiClient.get<any>(apisData.workload.byProject(projectId));
        return extractRows(data);
    },

    bySprintHandler: async (sprintId: string): Promise<WorkloadUserRowInterface[]> => {
        if (!sprintId) throw new Error("Sprint ID is required");
        const { data } = await apiClient.get<any>(apisData.workload.bySprint(sprintId));
        return extractRows(data);
    },

    byUserHandler: async (userId: string): Promise<WorkloadUserRowInterface[]> => {
        if (!userId) throw new Error("User ID is required");
        const { data } = await apiClient.get<any>(apisData.workload.byUser(userId));
        return extractRows(data);
    },
};
