import type { UserRole } from "@/enums";

export interface ApiSuccessResponse<T> {
    data: T;
    isSuccess: boolean;
    message?: string;
}

export interface UserInterface {
    id: string;
    full_name: string;
    email: string;
    role: UserRole;
    avatar_initials: string;
    team?: string;
    status?: string;
}

export interface ThemeContextInterface {
    isDarkMode: boolean;
    onToggleTheme: () => void;
}
