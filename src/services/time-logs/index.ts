import { apisData } from "@/data";
import type { CreateTimeLogPayloadInterface, TimeLogInterface, TimeLogsSummaryInterface, UpdateTimeLogPayloadInterface } from "@/interfaces";
import { apiClient } from "@/lib/axios";

interface TimeLogsMetaInterface {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export interface TimeLogsListResponseInterface {
    data: TimeLogInterface[];
    meta?: TimeLogsMetaInterface;
}

export const timeLogsService = {
    sprintListHandler: async (sprintId: string): Promise<TimeLogsListResponseInterface> => {
        const { data } = await apiClient.get<TimeLogsListResponseInterface>(apisData.timeLogs.sprintList(sprintId));
        return data;
    },

    taskListHandler: async (taskId: string): Promise<{ data: TimeLogInterface[] }> => {
        const { data } = await apiClient.get<{ data: TimeLogInterface[] }>(apisData.timeLogs.taskList(taskId));
        return data;
    },

    getByTaskHandler: async (taskId: string): Promise<{ data: TimeLogInterface[] }> => {
        const { data } = await apiClient.get<{ data: TimeLogInterface[] }>(apisData.timeLogs.taskList(taskId));
        return data;
    },

    getBySprintHandler: async (sprintId: string): Promise<{ data: TimeLogInterface[] }> => {
        const { data } = await apiClient.get<{ data: TimeLogInterface[] }>(apisData.timeLogs.sprintList(sprintId));
        return data;
    },

    getSummaryHandler: async (sprintId: string): Promise<{ data: TimeLogsSummaryInterface }> => {
        const { data } = await apiClient.get<{ data: TimeLogsSummaryInterface }>(apisData.timeLogs.summary(sprintId));
        return data;
    },

    createHandler: async (taskId: string, payload: CreateTimeLogPayloadInterface): Promise<{ data: TimeLogInterface }> => {
        const { data } = await apiClient.post<{ data: TimeLogInterface }>(apisData.timeLogs.create(taskId), payload);
        return data;
    },

    updateHandler: async (taskId: string, payload: UpdateTimeLogPayloadInterface): Promise<{ data: TimeLogInterface }> => {
        const { data } = await apiClient.put<{ data: TimeLogInterface }>(apisData.timeLogs.update(taskId), payload);
        return data;
    },

    deleteHandler: async (id: string): Promise<void> => {
        await apiClient.delete(apisData.timeLogs.delete(id));
    },
};
