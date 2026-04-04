import { createContext } from "react";

import type { AuthContextInterface } from "@/interfaces";

export const AuthContext = createContext<AuthContextInterface>({
    isAuthenticated: false,
    user: null,
    onLogin: () => false,
    onLogout: () => {},
    onUpdateUser: () => {},
});
