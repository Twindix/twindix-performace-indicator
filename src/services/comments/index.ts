import { apisData } from "@/data";
import type { CommentDetailResponseInterface, CommentsAnalyticsResponseInterface, CommentsListFiltersInterface, CommentsListResponseInterface, CreateCommentPayloadInterface, UpdateCommentPayloadInterface } from "@/interfaces";
import { apiClient } from "@/lib/axios";

export const commentsService = {
    listHandler: async (sprintId: string, filters?: CommentsListFiltersInterface): Promise<CommentsListResponseInterface> => {
        const { data } = await apiClient.get<CommentsListResponseInterface>(apisData.comments.list(sprintId), { params: filters });
        return data;
    },

    analyticsHandler: async (sprintId: string): Promise<CommentsAnalyticsResponseInterface> => {
        const { data } = await apiClient.get<CommentsAnalyticsResponseInterface>(apisData.comments.analytics(sprintId));
        return data;
    },

    detailHandler: async (id: string): Promise<CommentDetailResponseInterface> => {
        const { data } = await apiClient.get<CommentDetailResponseInterface>(apisData.comments.detail(id));
        return data;
    },

    createHandler: async (sprintId: string, payload: CreateCommentPayloadInterface): Promise<CommentDetailResponseInterface> => {
        const { data } = await apiClient.post<CommentDetailResponseInterface>(apisData.comments.create(sprintId), payload);
        return data;
    },

    updateHandler: async (id: string, payload: UpdateCommentPayloadInterface): Promise<CommentDetailResponseInterface> => {
        const { data } = await apiClient.put<CommentDetailResponseInterface>(apisData.comments.update(id), payload);
        return data;
    },

    deleteHandler: async (id: string): Promise<void> => {
        await apiClient.delete(apisData.comments.delete(id));
    },

    respondHandler: async (id: string): Promise<CommentDetailResponseInterface> => {
        const { data } = await apiClient.patch<CommentDetailResponseInterface>(apisData.comments.respond(id));
        return data;
    },
};
