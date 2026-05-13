import type { RoleTier } from "@/constants/permissions";

export interface ApiSuccessResponse<T> {
    data: T;
    isSuccess?: boolean;
    message?: string;
}

export interface PaginationMetaInterface {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    path?: string;
    links?: Array<{ url: string | null; label: string; page: number | null; active: boolean }>;
}

export interface PaginationLinksInterface {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
}

export interface PaginatedResponseInterface<T> {
    data: T[];
    meta: PaginationMetaInterface;
    links?: PaginationLinksInterface;
}

export interface PaginationParamsInterface {
    page?: number;
    per_page?: number;
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
    role_tier: RoleTier;
    team: UserTeamInterface;
    avatar_initials: string;
    account_status: string | null;
    presence_status: string | null;
    last_seen_at: string | null;
    settings: UserSettingsInterface;
    created_at: string;
    // Additional properties expected by the code
    name?: string; // Alias for full_name
    avatar?: string; // Alias for avatar_initials
    role?: string; // Alias for role_label
    status?: string; // Alias for account_status
}

export interface ThemeContextInterface {
    isDarkMode: boolean;
    onToggleTheme: () => void;
}
