import { createContext } from "react";

import type { AuthContextInterface } from "@/interfaces";

export const AuthContext = createContext<AuthContextInterface>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    onLogin: async () => {},
    onLogout: async () => {},
    onUpdateUser: () => {},
});
