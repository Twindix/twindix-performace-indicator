import { create } from "zustand";

interface NetworkErrorStore {
    hasNetworkError: boolean;
    onSetNetworkError: () => void;
    onClearNetworkError: () => void;
}

export const useNetworkErrorStore = create<NetworkErrorStore>((set) => ({
    hasNetworkError: false,

    onSetNetworkError: () => set({ hasNetworkError: true }),

    onClearNetworkError: () => set({ hasNetworkError: false }),
}));
