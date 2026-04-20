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
    full_name?: string;
    email?: string;
    role_label?: string;
    role_tier?: string;
    team?: UserTeamInterface | string;
    avatar_initials?: string;
    account_status?: string;
    presence_status?: string;
    last_seen_at?: string;
    settings?: UserSettingsInterface;
    created_at?: string;
    // legacy seed/localStorage aliases
    name?: string;
    avatar?: string;
    role?: string;
    status?: string;
}

export interface SprintInterface {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    status: string;
    healthScore?: number;
    goals?: string[];
    [key: string]: unknown;
}

export interface ThemeContextInterface {
    isDarkMode: boolean;
    onToggleTheme: () => void;
}
