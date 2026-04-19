import type { UserRole } from "@/enums";

export interface ApiSuccessResponse<T> {
    data: T;
    isSuccess: boolean;
    message?: string;
}

export interface LoginResponseInterface {
    data: {
        token: string;
        user: UserInterface;
    };
    isSuccess: boolean;
    message: string;
}

export interface MeResponseInterface {
    data: UserInterface;
    isSuccess: boolean;
}

export interface UserInterface {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatar: string;
    team: string;
    status?: string;
}

export interface AuthContextInterface {
    isAuthenticated: boolean;
    user: UserInterface | null;
    onLogin: (email: string, password: string) => boolean;
    onLogout: () => void;
    onUpdateUser: (updates: Partial<UserInterface>) => void;
}

export interface ThemeContextInterface {
    isDarkMode: boolean;
    onToggleTheme: () => void;
}
