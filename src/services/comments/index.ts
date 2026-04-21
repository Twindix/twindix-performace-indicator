import { apiClient } from "@/lib/axios";
import { apisData } from "@/data/apis";
import type { CommentInterface, CommentsAnalyticsInterface, CommentsListFiltersInterface, CommentsListResponseInterface, CommentDetailResponseInterface, CreateCommentPayloadInterface, UpdateCommentPayloadInterface, TaskCommentInterface } from "@/interfaces";

export const commentsService = {
    listByTaskHandler: async (taskId: string): Promise<TaskCommentInterface[]> => {
        const { data } = await apiClient.get<{ data: TaskCommentInterface[] }>(apisData.comments.taskList(taskId));
        return data.data ?? (data as any);
    },

    listHandler: async (sprintId: string, filters?: CommentsListFiltersInterface): Promise<CommentsListResponseInterface> => {
        const { data } = await apiClient.get<CommentsListResponseInterface>(apisData.comments.list(sprintId), { params: filters });
        return data;
    },

    analyticsHandler: async (sprintId: string): Promise<CommentsAnalyticsInterface> => {
        const { data } = await apiClient.get<{ data: CommentsAnalyticsInterface }>(apisData.comments.analytics(sprintId));
        return data.data ?? (data as any);
    },

    detailHandler: async (id: string): Promise<CommentInterface> => {
        const { data } = await apiClient.get<CommentDetailResponseInterface>(apisData.comments.detail(id));
        return data.data;
    },

    createHandler: async (taskId: string, payload: CreateCommentPayloadInterface): Promise<CommentInterface> => {
        const { data } = await apiClient.post<{ data: CommentInterface }>(apisData.comments.create(taskId), payload);
        return data.data ?? (data as any);
    },

    updateHandler: async (id: string, payload: UpdateCommentPayloadInterface): Promise<CommentInterface> => {
        const { data } = await apiClient.put<{ data: CommentInterface }>(apisData.comments.update(id), payload);
        return data.data ?? (data as any);
    },

    respondHandler: async (id: string): Promise<CommentInterface> => {
        const { data } = await apiClient.patch<{ data: CommentInterface }>(apisData.comments.respond(id));
        return data.data ?? (data as any);
    },

    deleteHandler: async (id: string): Promise<void> => {
        await apiClient.delete(apisData.comments.delete(id));
    },
};
