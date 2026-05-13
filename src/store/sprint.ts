import { create } from "zustand";

import { getStorageItem, setStorageItem, storageKeys } from "@/utils";

interface SprintStore {
    activeSprintId: string;
    onSetActiveSprint: (id: string) => void;
}

const initialSprintId = getStorageItem<string>(storageKeys.activeSprintId) ?? "";

export const useSprintStore = create<SprintStore>((set) => ({
    activeSprintId: initialSprintId,
    onSetActiveSprint: (id: string) => {
        setStorageItem(storageKeys.activeSprintId, id);
        set({ activeSprintId: id });
    },
}));
