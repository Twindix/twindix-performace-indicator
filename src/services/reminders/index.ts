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

export const remindersService = {
    listHandler: async (filters?: RemindersListFiltersInterface): Promise<RemindersListResponseInterface> => {
        const { data } = await apiClient.get<RemindersListResponseInterface>(apisData.reminders.list, { params: filters });
        return data;
    },

    detailHandler: async (id: string): Promise<ReminderInterface> => {
        const { data } = await apiClient.get(apisData.reminders.detail(id));
        return unwrap<ReminderInterface>(data);
    },

    createHandler: async (payload: CreateReminderPayloadInterface): Promise<ReminderInterface> => {
        const { data } = await apiClient.post(apisData.reminders.create, payload);
        return unwrap<ReminderInterface>(data);
    },

    updateHandler: async (id: string, payload: UpdateReminderPayloadInterface): Promise<ReminderInterface> => {
        const { data } = await apiClient.put(apisData.reminders.update(id), payload);
        return unwrap<ReminderInterface>(data);
    },

    dismissHandler: async (id: string): Promise<ReminderInterface> => {
        const { data } = await apiClient.patch(apisData.reminders.dismiss(id));
        return unwrap<ReminderInterface>(data);
    },

    reactivateHandler: async (id: string): Promise<ReminderInterface> => {
        const { data } = await apiClient.patch(apisData.reminders.reactivate(id));
        return unwrap<ReminderInterface>(data);
    },

    deleteHandler: async (id: string): Promise<void> => {
        await apiClient.delete(apisData.reminders.delete(id));
    },

    statsHandler: async (): Promise<RemindersStatsInterface> => {
        const { data } = await apiClient.get(apisData.reminders.stats);
        return unwrap<RemindersStatsInterface>(data);
    },
};
