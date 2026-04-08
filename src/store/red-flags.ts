import { create } from "zustand";

import type { RedFlagInterface } from "@/interfaces";
import { getStorageItem, setStorageItem, storageKeys } from "@/utils";

interface RedFlagStore {
    flags: RedFlagInterface[];
    load: () => void;
    add: (flag: RedFlagInterface) => void;
    update: (id: string, changes: Partial<RedFlagInterface>) => void;
    remove: (id: string) => void;
}

export const useRedFlagStore = create<RedFlagStore>((set, get) => ({
    flags: [],

    load: () => {
        const stored = getStorageItem<RedFlagInterface[]>(storageKeys.redFlags) ?? [];
        set({ flags: stored });
    },

    add: (flag) => {
        const next = [...get().flags, flag];
        setStorageItem(storageKeys.redFlags, next);
        set({ flags: next });
    },

    update: (id, changes) => {
        const next = get().flags.map((f) => (f.id === id ? { ...f, ...changes, updatedAt: new Date().toISOString() } : f));
        setStorageItem(storageKeys.redFlags, next);
        set({ flags: next });
    },

    remove: (id) => {
        const next = get().flags.filter((f) => f.id !== id);
        setStorageItem(storageKeys.redFlags, next);
        set({ flags: next });
    },
}));
