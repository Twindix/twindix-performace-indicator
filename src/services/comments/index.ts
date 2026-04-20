import { apiClient } from "@/lib/axios";
import { apisData } from "@/data/apis";
import type { TaskCommentInterface } from "@/interfaces";

export const commentsService = {
    listByTaskHandler: async (taskId: string): Promise<TaskCommentInterface[]> => {
        const { data } = await apiClient.get<{ data: TaskCommentInterface[] }>(apisData.comments.taskList(taskId));
        return data.data ?? data;
    },

    createHandler: async (payload: { task_id: string; content: string }): Promise<TaskCommentInterface> => {
        const { data } = await apiClient.post<{ data: TaskCommentInterface }>(apisData.comments.create, payload);
        return data.data ?? data;
    },

    deleteHandler: async (id: string): Promise<void> => {
        await apiClient.delete(apisData.comments.delete(id));
    },
};
