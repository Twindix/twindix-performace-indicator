import { apisData } from "@/data";
import type { ApiSuccessResponse, CreateTaskPayloadInterface, TaskDetailResponseInterface, TaskInterface, TaskKanbanResponseInterface, TaskListResponseInterface, TaskPipelineCountsResponseInterface, TaskPipelineResponseInterface, TaskStatsResponseInterface, UpdateTaskPayloadInterface, UpdateTaskStatusPayloadInterface } from "@/interfaces";
import { apiClient } from "@/lib/axios";

export const tasksService = {
    kanbanHandler: async (sprintId: string): Promise<TaskKanbanResponseInterface> => {
        const { data } = await apiClient.get<TaskKanbanResponseInterface>(apisData.tasks.kanban(sprintId));
        return data;
    },

    pipelineHandler: async (sprintId: string): Promise<TaskPipelineResponseInterface> => {
        const { data } = await apiClient.get<TaskPipelineResponseInterface>(apisData.tasks.pipeline(sprintId));
        return data;
    },

    pipelineCountsHandler: async (sprintId: string): Promise<TaskPipelineCountsResponseInterface> => {
        const { data } = await apiClient.get<TaskPipelineCountsResponseInterface>(apisData.tasks.pipelineCounts(sprintId));
        return data;
    },

    statsHandler: async (sprintId: string): Promise<TaskStatsResponseInterface> => {
        const { data } = await apiClient.get<TaskStatsResponseInterface>(apisData.tasks.stats(sprintId));
        return data;
    },

    listHandler: async (sprintId: string): Promise<TaskListResponseInterface> => {
        const { data } = await apiClient.get<TaskListResponseInterface>(apisData.tasks.list(sprintId));
        return data;
    },

    createHandler: async (sprintId: string, payload: CreateTaskPayloadInterface): Promise<TaskDetailResponseInterface> => {
        const { data } = await apiClient.post<TaskDetailResponseInterface>(apisData.tasks.create(sprintId), payload);
        return data;
    },

    detailHandler: async (taskId: string): Promise<TaskDetailResponseInterface> => {
        const { data } = await apiClient.get<TaskDetailResponseInterface>(apisData.tasks.detail(taskId));
        return data;
    },

    updateHandler: async (taskId: string, payload: UpdateTaskPayloadInterface): Promise<TaskDetailResponseInterface> => {
        const { data } = await apiClient.put<TaskDetailResponseInterface>(apisData.tasks.update(taskId), payload);
        return data;
    },

    updateStatusHandler: async (taskId: string, payload: UpdateTaskStatusPayloadInterface): Promise<TaskDetailResponseInterface> => {
        const { data } = await apiClient.patch<TaskDetailResponseInterface>(apisData.tasks.updateStatus(taskId), payload);
        return data;
    },

    deleteHandler: async (taskId: string): Promise<void> => {
        await apiClient.delete(apisData.tasks.delete(taskId));
    },

    addTagsHandler: async (taskId: string, tags: string[]): Promise<TaskDetailResponseInterface> => {
        const { data } = await apiClient.post<TaskDetailResponseInterface>(apisData.tasks.addTags(taskId), { tags });
        return data;
    },

    removeTagHandler: async (taskId: string, tag: string): Promise<TaskDetailResponseInterface> => {
        const { data } = await apiClient.delete<TaskDetailResponseInterface>(apisData.tasks.removeTag(taskId, tag));
        return data;
    },

    addAttachmentHandler: async (taskId: string, file: File): Promise<TaskDetailResponseInterface> => {
        const formData = new FormData();
        formData.append("file", file);
        const { data } = await apiClient.post<TaskDetailResponseInterface>(apisData.tasks.addAttachment(taskId), formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return data;
    },

    removeAttachmentHandler: async (taskId: string, attachmentId: string): Promise<void> => {
        await apiClient.delete(apisData.tasks.removeAttachment(taskId, attachmentId));
    },

    transitionCriteriaHandler: async (taskId: string): Promise<ApiSuccessResponse<TaskInterface[]>> => {
        const { data } = await apiClient.get<ApiSuccessResponse<TaskInterface[]>>(apisData.tasks.transitionCriteria(taskId));
        return data;
    },
};
