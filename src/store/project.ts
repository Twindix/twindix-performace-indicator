import { create } from "zustand";

interface ProjectStore {
    activeProjectId: string;
    onSetActiveProject: (id: string) => void;
}

export const useProjectStore = create<ProjectStore>((set) => ({
    activeProjectId: "",
    onSetActiveProject: (id) => set({ activeProjectId: id }),
}));
