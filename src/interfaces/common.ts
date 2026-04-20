export interface ApiSuccessResponse<T> {
    data: T;
    isSuccess?: boolean;
    message?: string;
}

export interface UserSettingsInterface {
    dark_mode: boolean;
    compact_view: boolean;
    language: string;
    date_format: string;
}

export interface UserTeamInterface {
    id: string;
    name: string;
}

export interface UserInterface {
    id: string;
    full_name: string;
    email: string;
    role_label: string;
    role_tier: string;
    team: UserTeamInterface;
    avatar_initials: string;
    account_status: string;
    presence_status: string;
    last_seen_at: string;
    settings: UserSettingsInterface;
    created_at: string;
}

export interface ThemeContextInterface {
    isDarkMode: boolean;
    onToggleTheme: () => void;
}
