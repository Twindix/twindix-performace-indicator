import type { UserInterface } from "@/interfaces/common";

export interface UsersListResponseInterface {
    data: UserInterface[];
    isSuccess: boolean;
}

export interface UserDetailResponseInterface {
    data: UserInterface;
    isSuccess: boolean;
}

export interface CreateUserPayloadInterface {
    full_name: string;
    email: string;
    password: string;
    role_tier?: string;
    role_label?: string;
    team_id?: string;
}

export interface UpdateUserPayloadInterface {
    full_name?: string;
    email?: string;
    role_tier?: string;
    role_label?: string;
    team_id?: string;
}

export interface UserSettingsInterface {
    dark_mode?: boolean;
    compact_view?: boolean;
    language?: string;
    date_format?: string;
}

export interface UserSettingsResponseInterface {
    data: UserSettingsInterface;
    isSuccess: boolean;
}

export interface UpdateProfilePayloadInterface {
    full_name?: string;
}

export interface UsersListFiltersInterface {
    per_page?: number;
    page?: number;
    role_tier?: string;
    team_id?: string;
}

export interface UsersContextInterface {
    users: UserInterface[];
    settings: UserSettingsInterface | null;
    isLoading: boolean;
    refetch: (filters?: UsersListFiltersInterface) => Promise<void>;
    refetchSettings: () => Promise<void>;
    patchUserLocal: (user: UserInterface) => void;
    removeUserLocal: (id: string) => void;
    setSettings: (settings: UserSettingsInterface) => void;
}
