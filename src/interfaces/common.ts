export interface ApiSuccessResponse<T> {
    data: T;
    isSuccess: boolean;
    message?: string;
}

export interface UserInterface {
    id: string;
    full_name: string;
    email: string;
    role_tier: string;
    role_label?: string;
    avatar_initials: string;
    team?: string | { id: string; name: string };
    account_status?: string;
}

export interface ThemeContextInterface {
    isDarkMode: boolean;
    onToggleTheme: () => void;
}
