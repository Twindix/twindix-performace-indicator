import type { SprintStatus, UserRole } from "@/enums";

export interface UserInterface {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatar: string;
    team: string;
}

export interface SprintInterface {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    status: SprintStatus;
    healthScore: number;
    goals: string[];
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
