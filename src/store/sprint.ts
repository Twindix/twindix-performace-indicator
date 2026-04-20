import { create } from "zustand";

interface SprintStore {
    activeSprintId: string;
    onSetActiveSprint: (id: string) => void;
}

export const useSprintStore = create<SprintStore>((set) => ({
    activeSprintId: "",
    onSetActiveSprint: (id: string) => set({ activeSprintId: id }),
}));
