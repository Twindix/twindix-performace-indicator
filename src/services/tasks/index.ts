import { apisData } from "@/data";
import type {
    CreateTaskPayloadInterface,
    KanbanBoardInterface,
    PipelineBoardInterface,
    TaskDetailResponseInterface,
    TaskInterface,
    TaskListResponseInterface,
    TaskStatsInterface,
    TransitionCriteriaResponseInterface,
    UpdateTaskPayloadInterface,
    UpdateTaskStatusPayloadInterface,
} from "@/interfaces";
import { apiClient } from "@/lib/axios";

export const tasksService = {
    kanbanHandler: async (sprintId: string): Promise<KanbanBoardInterface> => {
        const { data } = await apiClient.get<KanbanBoardInterface>(apisData.tasks.kanban(sprintId));
        return data;
    },

    pipelineHandler: async (sprintId: string): Promise<PipelineBoardInterface> => {
        const { data } = await apiClient.get<PipelineBoardInterface>(apisData.tasks.pipeline(sprintId));
        return data;
    },

    statsHandler: async (sprintId: string): Promise<TaskStatsInterface> => {
        const { data } = await apiClient.get<TaskStatsInterface>(apisData.tasks.stats(sprintId));
        return data;
    },

    listHandler: async (sprintId: string, params?: {
        status?: string;
        assigned_to?: string;
        priority?: string;
        type?: string;
        search?: string;
        per_page?: number;
        sort_by?: string;
        sort_order?: string;
    }): Promise<TaskListResponseInterface> => {
        const { data } = await apiClient.get<TaskListResponseInterface>(apisData.tasks.list(sprintId), { params });
        return data;
    },

    detailHandler: async (taskId: string): Promise<TaskDetailResponseInterface> => {
        const { data } = await apiClient.get<TaskDetailResponseInterface>(apisData.tasks.detail(taskId));
        return data;
    },

    createHandler: async (sprintId: string, payload: CreateTaskPayloadInterface): Promise<TaskDetailResponseInterface> => {
        const { data } = await apiClient.post<TaskDetailResponseInterface>(apisData.tasks.create(sprintId), payload);
        return data;
    },

    updateHandler: async (taskId: string, payload: UpdateTaskPayloadInterface): Promise<TaskDetailResponseInterface> => {
        const { data } = await apiClient.put<TaskDetailResponseInterface>(apisData.tasks.update(taskId), payload);
        return data;
    },

    updateStatusHandler: async (taskId: string, payload: UpdateTaskStatusPayloadInterface): Promise<TaskInterface> => {
        const { data } = await apiClient.patch<TaskInterface>(apisData.tasks.updateStatus(taskId), payload);
        return data;
    },

    deleteHandler: async (taskId: string): Promise<void> => {
        await apiClient.delete(apisData.tasks.delete(taskId));
    },

    addTagsHandler: async (taskId: string, tags: string[]): Promise<TaskInterface> => {
        const { data } = await apiClient.post<TaskInterface>(apisData.tasks.addTags(taskId), { tags });
        return data;
    },

    removeTagHandler: async (taskId: string, tag: string): Promise<void> => {
        await apiClient.delete(apisData.tasks.removeTag(taskId, tag));
    },

    addAttachmentHandler: async (taskId: string, file: File): Promise<TaskDetailResponseInterface> => {
        const form = new FormData();
        form.append("file", file);
        const { data } = await apiClient.post<TaskDetailResponseInterface>(
            apisData.tasks.addAttachment(taskId),
            form,
            { headers: { "Content-Type": "multipart/form-data" } },
        );
        return data;
    },

    removeAttachmentHandler: async (taskId: string, attachmentId: string): Promise<void> => {
        await apiClient.delete(apisData.tasks.removeAttachment(taskId, attachmentId));
    },

    transitionCriteriaHandler: async (taskId: string, targetStatus: string): Promise<TransitionCriteriaResponseInterface> => {
        const { data } = await apiClient.get<TransitionCriteriaResponseInterface>(
            apisData.tasks.transitionCriteria(taskId),
            { params: { target_status: targetStatus } },
        );
        return data;
    },

    markCompleteHandler: async (taskId: string): Promise<TaskInterface> => {
        const { data } = await apiClient.post<{ task: TaskInterface } | TaskInterface>(apisData.tasks.markComplete(taskId));
        return (data && typeof data === "object" && "task" in data ? data.task : data) as TaskInterface;
    },
};
