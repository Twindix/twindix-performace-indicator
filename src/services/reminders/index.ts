import { apisData } from "@/data";
import type {
    CreateReminderPayloadInterface,
    ReminderInterface,
    RemindersListFiltersInterface,
    RemindersListResponseInterface,
    RemindersStatsInterface,
    UpdateReminderPayloadInterface,
} from "@/interfaces";
import { apiClient } from "@/lib/axios";

const unwrap = <T,>(payload: unknown): T => {
    if (payload && typeof payload === "object" && "data" in (payload as Record<string, unknown>)) {
        return (payload as { data: T }).data;
    }
    return payload as T;
};

const normalizeReminder = (raw: any): ReminderInterface => ({
    id: raw.id,
    project_id: raw.project_id ?? raw.project?.id ?? null,
    title: raw.title,
    description: raw.description ?? null,
    expires_at: raw.expires_at,
    notify_before_days: raw.notify_before_days ?? [],
    status: raw.status,
    created_by: raw.creator
        ? { id: raw.creator.id, full_name: raw.creator.full_name ?? "", avatar_initials: raw.creator.avatar_initials ?? "" }
        : (typeof raw.created_by === "object" && raw.created_by ? raw.created_by : { id: raw.created_by ?? "", full_name: "", avatar_initials: "" }),
    created_at: raw.created_at,
    updated_at: raw.updated_at,
});

export const remindersService = {
    listHandler: async (filters?: RemindersListFiltersInterface): Promise<RemindersListResponseInterface> => {
        const { data } = await apiClient.get<any>(apisData.reminders.list, { params: filters });
        const meta = data.meta ?? {
            current_page: data.current_page ?? 1,
            last_page: data.last_page ?? 1,
            per_page: data.per_page ?? 20,
            total: data.total ?? 0,
            from: data.from ?? null,
            to: data.to ?? null,
        };
        return { ...data, data: (data.data ?? []).map(normalizeReminder), meta };
    },

    detailHandler: async (id: string): Promise<ReminderInterface> => {
        const { data } = await apiClient.get(apisData.reminders.detail(id));
        return normalizeReminder(unwrap<any>(data));
    },

    createHandler: async (payload: CreateReminderPayloadInterface): Promise<ReminderInterface> => {
        const { data } = await apiClient.post(apisData.reminders.create, payload);
        return normalizeReminder(unwrap<any>(data));
    },

    updateHandler: async (id: string, payload: UpdateReminderPayloadInterface): Promise<ReminderInterface> => {
        const { data } = await apiClient.put(apisData.reminders.update(id), payload);
        return normalizeReminder(unwrap<any>(data));
    },

    dismissHandler: async (id: string): Promise<ReminderInterface> => {
        const { data } = await apiClient.patch(apisData.reminders.dismiss(id));
        return normalizeReminder(unwrap<any>(data));
    },

    reactivateHandler: async (id: string): Promise<ReminderInterface> => {
        const { data } = await apiClient.patch(apisData.reminders.reactivate(id));
        return normalizeReminder(unwrap<any>(data));
    },

    deleteHandler: async (id: string): Promise<void> => {
        await apiClient.delete(apisData.reminders.delete(id));
    },

    statsHandler: async (): Promise<RemindersStatsInterface> => {
        const { data } = await apiClient.get(apisData.reminders.stats);
        return unwrap<RemindersStatsInterface>(data);
    },
};
