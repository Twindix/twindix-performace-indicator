import { apisData } from "@/data";
import type {
    ApiMeetingAttachmentInterface,
    ApiMeetingCommentInterface,
    ApiMeetingTimeSlotInterface,
    CreateMeetingCommentPayloadInterface,
    CreateMeetingPayloadInterface,
    CreateMeetingTimeSlotPayloadInterface,
    MeetingDetailInterface,
    MeetingsListFiltersInterface,
    MeetingsListResponseInterface,
    UpdateMeetingPayloadInterface,
    UpdateRsvpPayloadInterface,
} from "@/interfaces";
import { apiClient } from "@/lib/axios";

const unwrap = <T,>(payload: unknown): T => {
    if (payload && typeof payload === "object" && "data" in (payload as Record<string, unknown>)) {
        return (payload as { data: T }).data;
    }
    return payload as T;
};

export const meetingsService = {
    listHandler: async (filters?: MeetingsListFiltersInterface): Promise<MeetingsListResponseInterface> => {
        const { data } = await apiClient.get<MeetingsListResponseInterface>(apisData.meetings.list, { params: filters });
        return data;
    },

    listLiteHandler: async (): Promise<{ id: string; title: string; status: string }[]> => {
        const { data } = await apiClient.get<{ id: string; title: string; status: string }[] | { data: { id: string; title: string; status: string }[] }>(
            apisData.meetings.listLite,
        );
        return Array.isArray(data) ? data : (data.data ?? []);
    },

    detailHandler: async (id: string): Promise<MeetingDetailInterface> => {
        const { data } = await apiClient.get(apisData.meetings.detail(id));
        return unwrap<MeetingDetailInterface>(data);
    },

    createHandler: async (payload: CreateMeetingPayloadInterface): Promise<MeetingDetailInterface> => {
        const { data } = await apiClient.post(apisData.meetings.create, payload);
        return unwrap<MeetingDetailInterface>(data);
    },

    updateHandler: async (id: string, payload: UpdateMeetingPayloadInterface): Promise<MeetingDetailInterface> => {
        const { data } = await apiClient.put(apisData.meetings.update(id), payload);
        return unwrap<MeetingDetailInterface>(data);
    },

    deleteHandler: async (id: string): Promise<void> => {
        await apiClient.delete(apisData.meetings.delete(id));
    },

    addSlotHandler: async (id: string, payload: CreateMeetingTimeSlotPayloadInterface): Promise<ApiMeetingTimeSlotInterface> => {
        const { data } = await apiClient.post(apisData.meetings.addSlot(id), payload);
        return unwrap<ApiMeetingTimeSlotInterface>(data);
    },

    removeSlotHandler: async (id: string, slotId: string): Promise<void> => {
        await apiClient.delete(apisData.meetings.removeSlot(id, slotId));
    },

    voteHandler: async (id: string, slotId: string): Promise<MeetingDetailInterface> => {
        const { data } = await apiClient.post(apisData.meetings.vote(id, slotId));
        return unwrap<MeetingDetailInterface>(data);
    },

    finalizeHandler: async (id: string): Promise<MeetingDetailInterface> => {
        const { data } = await apiClient.patch(apisData.meetings.finalize(id));
        return unwrap<MeetingDetailInterface>(data);
    },

    updateRsvpHandler: async (id: string, userId: string, payload: UpdateRsvpPayloadInterface): Promise<MeetingDetailInterface> => {
        const { data } = await apiClient.patch(apisData.meetings.rsvp(id, userId), payload);
        return unwrap<MeetingDetailInterface>(data);
    },

    commentsListHandler: async (id: string): Promise<ApiMeetingCommentInterface[]> => {
        const { data } = await apiClient.get<ApiMeetingCommentInterface[] | { data: ApiMeetingCommentInterface[] }>(
            apisData.meetings.comments(id),
        );
        return Array.isArray(data) ? data : (data.data ?? []);
    },

    commentCreateHandler: async (id: string, payload: CreateMeetingCommentPayloadInterface): Promise<ApiMeetingCommentInterface> => {
        const { data } = await apiClient.post(apisData.meetings.comments(id), payload);
        return unwrap<ApiMeetingCommentInterface>(data);
    },

    commentDeleteHandler: async (id: string, commentId: string): Promise<void> => {
        await apiClient.delete(apisData.meetings.commentDelete(id, commentId));
    },

    uploadAttachmentHandler: async (id: string, file: File): Promise<ApiMeetingAttachmentInterface> => {
        const form = new FormData();
        form.append("file", file);
        const { data } = await apiClient.post(apisData.meetings.attachments(id), form, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return unwrap<ApiMeetingAttachmentInterface>(data);
    },

    attachmentDeleteHandler: async (id: string, attachmentId: string): Promise<void> => {
        await apiClient.delete(apisData.meetings.attachmentDelete(id, attachmentId));
    },
};
