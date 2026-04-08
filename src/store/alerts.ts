import { create } from "zustand";

import type { AlertInterface } from "@/interfaces";
import { getStorageItem, setStorageItem, storageKeys } from "@/utils";

interface AlertStore {
    alerts: AlertInterface[];
    load: () => void;
    add: (alert: AlertInterface) => void;
    update: (id: string, changes: Partial<AlertInterface>) => void;
    remove: (id: string) => void;
    resolve: (id: string, userId: string) => void;
}

export const useAlertStore = create<AlertStore>((set, get) => ({
    alerts: [],

    load: () => {
        const stored = getStorageItem<AlertInterface[]>(storageKeys.alerts) ?? [];
        set({ alerts: stored });
    },

    add: (alert) => {
        const next = [...get().alerts, alert];
        setStorageItem(storageKeys.alerts, next);
        set({ alerts: next });
    },

    update: (id, changes) => {
        const next = get().alerts.map((a) =>
            a.id === id ? { ...a, ...changes, updatedAt: new Date().toISOString() } : a,
        );
        setStorageItem(storageKeys.alerts, next);
        set({ alerts: next });
    },

    remove: (id) => {
        const next = get().alerts.filter((a) => a.id !== id);
        setStorageItem(storageKeys.alerts, next);
        set({ alerts: next });
    },

    resolve: (id, userId) => {
        const next = get().alerts.map((a) =>
            a.id === id && !a.resolvedByIds.includes(userId)
                ? { ...a, resolvedByIds: [...a.resolvedByIds, userId], updatedAt: new Date().toISOString() }
                : a,
        );
        setStorageItem(storageKeys.alerts, next);
        set({ alerts: next });
    },
}));
