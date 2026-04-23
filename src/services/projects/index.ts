import { apisData } from "@/data";
import type {
    CreateProjectPayloadInterface,
    ProjectInterface,
    ProjectLiteInterface,
    SprintInterface,
    UpdateProjectPayloadInterface,
} from "@/interfaces";
import { apiClient } from "@/lib/axios";

const unwrap = <T,>(payload: unknown): T => {
    if (payload && typeof payload === "object" && "data" in (payload as Record<string, unknown>)) {
        return (payload as { data: T }).data;
    }
    return payload as T;
};

export const projectsService = {
    listHandler: async (params?: { status?: string; per_page?: number; page?: number }): Promise<ProjectInterface[]> => {
        const res = await apiClient.get(apisData.projects.list, { params });
        return unwrap<ProjectInterface[]>(res.data);
    },

    listLiteHandler: async (): Promise<ProjectLiteInterface[]> => {
        const res = await apiClient.get<ProjectLiteInterface[] | { data: ProjectLiteInterface[] }>(apisData.projects.listLite);
        return Array.isArray(res.data) ? res.data : (res.data.data ?? []);
    },

    detailHandler: async (id: string): Promise<ProjectInterface> => {
        const res = await apiClient.get(apisData.projects.detail(id));
        return unwrap<ProjectInterface>(res.data);
    },

    createHandler: async (payload: CreateProjectPayloadInterface): Promise<ProjectInterface> => {
        const res = await apiClient.post(apisData.projects.create, payload);
        return unwrap<ProjectInterface>(res.data);
    },

    updateHandler: async (id: string, payload: UpdateProjectPayloadInterface): Promise<ProjectInterface> => {
        const res = await apiClient.put(apisData.projects.update(id), payload);
        return unwrap<ProjectInterface>(res.data);
    },

    deleteHandler: async (id: string): Promise<void> => {
        await apiClient.delete(apisData.projects.delete(id));
    },

    sprintsHandler: async (id: string): Promise<SprintInterface[]> => {
        const res = await apiClient.get(apisData.projects.sprints(id));
        return unwrap<SprintInterface[]>(res.data);
    },
};
