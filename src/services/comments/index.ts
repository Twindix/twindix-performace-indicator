import { apiClient } from "@/lib/axios";
import { apisData } from "@/data/apis";
import type { TaskCommentInterface, CommentListResponseInterface, CreateCommentPayloadInterface, UpdateCommentPayloadInterface } from "@/interfaces";

export const commentsService = {
    listByTaskHandler: async (taskId: string): Promise<CommentListResponseInterface> => {
        const { data } = await apiClient.get<CommentListResponseInterface>(apisData.comments.taskList(taskId));
        return data;
    },

    createHandler: async (taskId: string, payload: CreateCommentPayloadInterface): Promise<TaskCommentInterface> => {
        const { data } = await apiClient.post<{ data: TaskCommentInterface }>(apisData.comments.create(taskId), payload);
        return data.data ?? data;
    },

    updateHandler: async (id: string, payload: UpdateCommentPayloadInterface): Promise<TaskCommentInterface> => {
        const { data } = await apiClient.put<{ data: TaskCommentInterface }>(apisData.comments.update(id), payload);
        return data.data ?? data;
    },

    deleteHandler: async (id: string): Promise<void> => {
        await apiClient.delete(apisData.comments.delete(id));
    },
};
