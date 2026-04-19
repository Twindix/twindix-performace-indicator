import type { SprintStatus, UserRole } from "@/enums";

export interface ApiSuccessResponse<T> {
    data: T;
    isSuccess: boolean;
    message?: string;
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

export interface SprintInterface {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    status: SprintStatus;
    healthScore: number;
    goals: string[];
}

export interface ThemeContextInterface {
    isDarkMode: boolean;
    onToggleTheme: () => void;
}
