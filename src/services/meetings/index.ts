import { apisData } from "@/data";
import type {
    ApiMeetingAttachmentInterface,
    ApiMeetingAttendeeInterface,
    ApiMeetingCommentInterface,
    ApiMeetingTimeSlotInterface,
    CreateMeetingCommentPayloadInterface,
    CreateMeetingPayloadInterface,
    CreateMeetingTimeSlotPayloadInterface,
    MeetingDetailInterface,
    MeetingListItemInterface,
    MeetingOrganizerInterface,
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

const combineDateTime = (date: string, time: string): string => `${date}T${time}:00`;

const normalizeOrganizer = (raw: any): MeetingOrganizerInterface => {
    if (raw.organizer) return raw.organizer;
    const c = raw.creator;
    if (!c) return { id: "", name: "" };
    return { id: c.id, name: c.full_name ?? c.name ?? "", avatar_initials: c.avatar_initials ?? null };
};

const normalizeSlot = (slot: any, attendees: any[] = []): ApiMeetingTimeSlotInterface => {
    const startDt: string = slot.start_time ?? "";
    const endDt: string = slot.end_time ?? "";
    const date = startDt.substring(0, 10);
    const startTime = startDt.includes("T") ? startDt.substring(11, 16) : startDt;
    const endTime = endDt.includes("T") ? endDt.substring(11, 16) : endDt;
    return {
        id: slot.id,
        date,
        start_time: startTime,
        end_time: endTime,
        votes_count: attendees.filter((a) => a.voted_slot_id === slot.id).length,
    };
};

const normalizeAttendee = (a: any): ApiMeetingAttendeeInterface => ({
    user_id: a.user_id,
    name: a.name ?? a.user?.full_name ?? "",
    role: a.role ?? a.user?.role_label ?? null,
    avatar_initials: a.avatar_initials ?? a.user?.avatar_initials ?? null,
    rsvp_status: a.rsvp_status ?? "pending",
    voted_slot_id: a.voted_slot_id ?? null,
});

const normalizeComment = (c: any): ApiMeetingCommentInterface => ({
    id: c.id,
    user_id: c.user_id ?? c.user?.id ?? "",
    user_name: c.user_name ?? c.user?.full_name ?? "",
    avatar_initials: c.avatar_initials ?? c.user?.avatar_initials ?? null,
    body: c.body,
    created_at: c.created_at,
    updated_at: c.updated_at,
});

const normalizeAttachment = (a: any): ApiMeetingAttachmentInterface => ({
    id: a.id,
    file_name: a.file_name ?? a.name ?? "",
    file_path: a.file_path ?? a.url ?? "",
    file_size: a.file_size ?? a.size ?? 0,
    uploaded_by: a.uploaded_by ?? (a.user ? { id: a.user.id, name: a.user.full_name } : { id: "", name: "" }),
    created_at: a.created_at,
});

const extractScheduledTimes = (raw: any) => {
    if (raw.date && raw.start_time) {
        return { date: raw.date, start_time: raw.start_time, end_time: raw.end_time ?? null };
    }
    const scheduled = raw.scheduled_at;
    if (!scheduled) return { date: null, start_time: null, end_time: null };
    const date = scheduled.substring(0, 10);
    const startTime = scheduled.includes("T") ? scheduled.substring(11, 16) : null;
    const durationMs = (raw.duration_minutes ?? 0) * 60000;
    let endTime: string | null = null;
    if (startTime && durationMs > 0) {
        const endDt = new Date(new Date(scheduled).getTime() + durationMs);
        endTime = `${String(endDt.getUTCHours()).padStart(2, "0")}:${String(endDt.getUTCMinutes()).padStart(2, "0")}`;
    }
    return { date, start_time: startTime, end_time: endTime };
};

const normalizeMeetingDetail = (raw: any): MeetingDetailInterface => {
    const attendees = (raw.attendees ?? []).map(normalizeAttendee);
    const times = extractScheduledTimes(raw);
    return {
        id: raw.id,
        title: raw.title,
        description: raw.description ?? null,
        status: raw.status,
        meeting_type: raw.meeting_type ?? raw.type,
        location: raw.location ?? raw.meeting_link ?? null,
        date: times.date,
        start_time: times.start_time,
        end_time: times.end_time,
        project: raw.project ? { id: raw.project.id, name: raw.project.name } : null,
        team: raw.team ? { id: raw.team.id, name: raw.team.name } : null,
        organizer: normalizeOrganizer(raw),
        attendees_count: raw.attendees_count ?? attendees.length,
        created_at: raw.created_at,
        notes: raw.notes ?? raw.agenda ?? null,
        time_slots: (raw.time_slots ?? []).map((slot: any) => normalizeSlot(slot, raw.attendees ?? [])),
        attendees,
        comments: (raw.comments ?? []).map(normalizeComment),
        attachments: (raw.attachments ?? []).map(normalizeAttachment),
        updated_at: raw.updated_at,
    };
};

const normalizeMeetingListItem = (raw: any): MeetingListItemInterface => {
    const times = extractScheduledTimes(raw);
    return {
        id: raw.id,
        title: raw.title,
        description: raw.description ?? null,
        status: raw.status,
        meeting_type: raw.meeting_type ?? raw.type,
        location: raw.location ?? raw.meeting_link ?? null,
        date: times.date,
        start_time: times.start_time,
        end_time: times.end_time,
        project: raw.project ? { id: raw.project.id, name: raw.project.name } : null,
        team: raw.team ? { id: raw.team.id, name: raw.team.name } : null,
        organizer: normalizeOrganizer(raw),
        attendees_count: raw.attendees_count ?? (raw.attendees?.length ?? 0),
        created_at: raw.created_at,
    };
};

const toSlotPayload = (slot: CreateMeetingTimeSlotPayloadInterface) => ({
    start_time: combineDateTime(slot.date, slot.start_time),
    end_time: combineDateTime(slot.date, slot.end_time),
});

export const meetingsService = {
    listHandler: async (projectId: string, filters?: MeetingsListFiltersInterface): Promise<MeetingsListResponseInterface> => {
        const { data } = await apiClient.get<any>(apisData.meetings.list(projectId), { params: filters });
        return {
            ...data,
            data: (data.data ?? []).map(normalizeMeetingListItem),
        };
    },

    listLiteHandler: async (): Promise<{ id: string; title: string; status: string }[]> => {
        const { data } = await apiClient.get<{ id: string; title: string; status: string }[] | { data: { id: string; title: string; status: string }[] }>(
            apisData.meetings.listLite,
        );
        return Array.isArray(data) ? data : (data.data ?? []);
    },

    detailHandler: async (id: string): Promise<MeetingDetailInterface> => {
        const { data } = await apiClient.get(apisData.meetings.detail(id));
        return normalizeMeetingDetail(unwrap<any>(data));
    },

    createHandler: async (projectId: string, payload: CreateMeetingPayloadInterface): Promise<MeetingDetailInterface> => {
        const { meeting_type, ...rest } = payload;
        const body = {
            ...rest,
            type: meeting_type,
            time_slots: payload.time_slots.map(toSlotPayload),
        };
        const { data } = await apiClient.post(apisData.meetings.create(projectId), body);
        return normalizeMeetingDetail(unwrap<any>(data));
    },

    updateHandler: async (id: string, payload: UpdateMeetingPayloadInterface): Promise<MeetingDetailInterface> => {
        const { meeting_type, ...rest } = payload;
        const body = { ...rest, ...(meeting_type !== undefined ? { type: meeting_type } : {}) };
        const { data } = await apiClient.put(apisData.meetings.update(id), body);
        return normalizeMeetingDetail(unwrap<any>(data));
    },

    deleteHandler: async (id: string): Promise<void> => {
        await apiClient.delete(apisData.meetings.delete(id));
    },

    addSlotHandler: async (id: string, payload: CreateMeetingTimeSlotPayloadInterface): Promise<ApiMeetingTimeSlotInterface> => {
        const body = toSlotPayload(payload);
        const { data } = await apiClient.post(apisData.meetings.addSlot(id), body);
        const raw = unwrap<any>(data);
        return normalizeSlot(raw);
    },

    removeSlotHandler: async (id: string, slotId: string): Promise<void> => {
        await apiClient.delete(apisData.meetings.removeSlot(id, slotId));
    },

    voteHandler: async (id: string, slotId: string): Promise<MeetingDetailInterface> => {
        const { data } = await apiClient.post(apisData.meetings.vote(id), { slot_id: slotId });
        return normalizeMeetingDetail(unwrap<any>(data));
    },

    selectSlotHandler: async (id: string, slotId: string): Promise<MeetingDetailInterface> => {
        const { data } = await apiClient.post(apisData.meetings.selectSlot(id), { slot_id: slotId });
        return normalizeMeetingDetail(unwrap<any>(data));
    },

    updateRsvpHandler: async (id: string, payload: UpdateRsvpPayloadInterface): Promise<MeetingDetailInterface> => {
        const { data } = await apiClient.post(apisData.meetings.rsvp(id), { status: payload.rsvp_status });
        return normalizeMeetingDetail(unwrap<any>(data));
    },

    commentsListHandler: async (id: string): Promise<ApiMeetingCommentInterface[]> => {
        const { data } = await apiClient.get<ApiMeetingCommentInterface[] | { data: ApiMeetingCommentInterface[] }>(
            apisData.meetings.comments(id),
        );
        const raw = Array.isArray(data) ? data : (data.data ?? []);
        return raw.map(normalizeComment);
    },

    commentCreateHandler: async (id: string, payload: CreateMeetingCommentPayloadInterface): Promise<ApiMeetingCommentInterface> => {
        const { data } = await apiClient.post(apisData.meetings.comments(id), payload);
        return normalizeComment(unwrap<any>(data));
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
        return normalizeAttachment(unwrap<any>(data));
    },

    attachmentDeleteHandler: async (id: string, attachmentId: string): Promise<void> => {
        await apiClient.delete(apisData.meetings.attachmentDelete(id, attachmentId));
    },
};
