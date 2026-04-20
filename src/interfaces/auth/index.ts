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
