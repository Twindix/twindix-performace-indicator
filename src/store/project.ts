import { create } from "zustand";

import { getStorageItem, setStorageItem, storageKeys } from "@/utils";

interface ProjectStore {
    activeProjectId: string;
    onSetActiveProject: (id: string) => void;
}

const initialProjectId = getStorageItem<string>(storageKeys.activeProjectId) ?? "";

export const useProjectStore = create<ProjectStore>((set) => ({
    activeProjectId: initialProjectId,
    onSetActiveProject: (id) => {
        setStorageItem(storageKeys.activeProjectId, id);
        set({ activeProjectId: id });
    },
}));
