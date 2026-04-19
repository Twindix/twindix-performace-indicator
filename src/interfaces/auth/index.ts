import type { UserInterface } from "@/interfaces/common";

export interface LoginResponseInterface {
    token: string;
    user: UserInterface;
}

export interface MeResponseInterface {
    data: UserInterface;
    isSuccess: boolean;
}

export interface AuthContextInterface {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: UserInterface | null;
    onLogin: (email: string, password: string) => Promise<void>;
    onLogout: () => Promise<void>;
    onUpdateUser: (updates: Partial<UserInterface>) => void;
}
