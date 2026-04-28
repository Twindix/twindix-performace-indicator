import type { UserInterface } from "@/interfaces/common";

export interface LoginResponseInterface {
    token: string;
    user: UserInterface;
}

export interface RefreshResponseInterface {
    token: string;
}

export interface MeResponseInterface {
    data: UserInterface;
    isSuccess?: boolean;
}

export type PresenceStatus = "active" | "offline";

export interface AuthStoreInterface {
    user: UserInterface | null;
    isLoading: boolean;
    setUser: (user: UserInterface | null) => void;
    setLoading: (isLoading: boolean) => void;
}
