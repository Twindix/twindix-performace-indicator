import { create } from "zustand";

import { commonData } from "@/data";
import type { AuthStoreInterface } from "@/interfaces";
import { AUTH_UNAUTHORIZED_EVENT } from "@/lib/axios";
import { deleteCookieHandler, getCookieHandler } from "@/lib/cookies";
import { authService } from "@/services";

export const useAuthStore = create<AuthStoreInterface>()((set) => ({
    user: null,
    isLoading: true,
    setUser: (user) => set({ user, isLoading: false }),
    setLoading: (isLoading) => set({ isLoading }),
}));

// Auto-initialize session on module load
const token = getCookieHandler(commonData.token.tokenKey);
if (token) {
    authService
        .meHandler()
        .then((user) => useAuthStore.getState().setUser(user))
        .catch(() => {
            deleteCookieHandler(commonData.token.tokenKey);
            useAuthStore.getState().setLoading(false);
        });
} else {
    useAuthStore.getState().setLoading(false);
}

// Dispatch unauthorized clears user state
window.addEventListener(AUTH_UNAUTHORIZED_EVENT, () => {
    useAuthStore.getState().setUser(null);
});
