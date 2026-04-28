import { useAuthStore } from "@/store/auth";

export const useAuth = () => {
    const { user, isLoading } = useAuthStore();

    return {
        user,
        isLoading,
        isAuthenticated: !!user,
    };
};
