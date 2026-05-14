import { create } from "zustand";

import { seedReminders } from "@/data/seed";
import { ReminderStatus } from "@/enums";
import type { CreateReminderPayloadInterface, ReminderInterface, UpdateReminderPayloadInterface } from "@/interfaces";

interface RemindersStore {
    reminders: ReminderInterface[];
    addReminder: (payload: CreateReminderPayloadInterface, by: { id: string; full_name: string; avatar_initials: string }) => ReminderInterface;
    updateReminder: (id: string, patch: UpdateReminderPayloadInterface) => void;
    removeReminder: (id: string) => void;
    setStatus: (id: string, status: ReminderStatus) => void;
}

const newId = () => `rem-${Math.random().toString(36).slice(2, 10)}`;

export const useRemindersStore = create<RemindersStore>((set) => ({
    reminders: seedReminders,
    addReminder: (payload, by) => {
        const created: ReminderInterface = {
            id: newId(),
            title: payload.title,
            description: payload.description ?? null,
            expires_at: payload.expires_at,
            notify_before_days: [...payload.notify_before_days].sort((a, b) => b - a),
            status: ReminderStatus.Active,
            created_by: by,
            created_at: new Date().toISOString(),
        };
        set((s) => ({ reminders: [created, ...s.reminders] }));
        return created;
    },
    updateReminder: (id, patch) =>
        set((s) => ({
            reminders: s.reminders.map((r) => {
                if (r.id !== id) return r;
                const next: ReminderInterface = { ...r, ...patch } as ReminderInterface;
                if (patch.notify_before_days) {
                    next.notify_before_days = [...patch.notify_before_days].sort((a, b) => b - a);
                }
                if (patch.description !== undefined) {
                    next.description = patch.description ?? null;
                }
                return next;
            }),
        })),
    removeReminder: (id) => set((s) => ({ reminders: s.reminders.filter((r) => r.id !== id) })),
    setStatus: (id, status) =>
        set((s) => ({ reminders: s.reminders.map((r) => (r.id === id ? { ...r, status } : r)) })),
}));
