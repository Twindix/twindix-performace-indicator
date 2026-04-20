export interface ApiSuccessResponse<T> {
    data: T;
    isSuccess?: boolean;
    message?: string;
}

export interface UserSettingsInterface {
    dark_mode: boolean | null;
    compact_view: boolean | null;
    language: string | null;
    date_format: string | null;
}

export interface UserTeamInterface {
    id: string;
    name: string;
}

export interface UserInterface {
    id: string;
    full_name: string;
    email: string;
    role_label: string | null;
    role_tier: string;
    team: UserTeamInterface;
    avatar_initials: string;
    account_status: string | null;
    presence_status: string | null;
    last_seen_at: string | null;
    settings: UserSettingsInterface;
    created_at: string;
}

export interface ThemeContextInterface {
    isDarkMode: boolean;
    onToggleTheme: () => void;
}
