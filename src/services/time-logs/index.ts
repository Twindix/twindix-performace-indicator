import { apisData } from "@/data";
import type { CreateTimeLogPayloadInterface, TimeLogDetailResponseInterface, TimeLogsListResponseInterface, TimeLogsSummaryResponseInterface, UpdateTimeLogPayloadInterface } from "@/interfaces";
import { apiClient } from "@/lib/axios";

export const timeLogsService = {
    sprintListHandler: async (sprintId: string): Promise<TimeLogsListResponseInterface> => {
        const { data } = await apiClient.get<TimeLogsListResponseInterface>(apisData.timeLogs.sprintList(sprintId));
        return data;
    },

    sprintSummaryHandler: async (sprintId: string): Promise<TimeLogsSummaryResponseInterface> => {
        const { data } = await apiClient.get<TimeLogsSummaryResponseInterface>(apisData.timeLogs.sprintSummary(sprintId));
        return data;
    },

    taskListHandler: async (taskId: string): Promise<TimeLogsListResponseInterface> => {
        const { data } = await apiClient.get<TimeLogsListResponseInterface>(apisData.timeLogs.taskList(taskId));
        return data;
    },

    createHandler: async (taskId: string, payload: CreateTimeLogPayloadInterface): Promise<TimeLogDetailResponseInterface> => {
        const { data } = await apiClient.post<TimeLogDetailResponseInterface>(apisData.timeLogs.create(taskId), payload);
        return data;
    },

    updateHandler: async (id: string, payload: UpdateTimeLogPayloadInterface): Promise<TimeLogDetailResponseInterface> => {
        const { data } = await apiClient.put<TimeLogDetailResponseInterface>(apisData.timeLogs.update(id), payload);
        return data;
    },

    deleteHandler: async (id: string): Promise<void> => {
        await apiClient.delete(apisData.timeLogs.delete(id));
    },
};
