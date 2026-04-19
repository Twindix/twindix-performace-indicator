export const apisData = {
    auth: {
        login: "/auth/login",
        me: "/auth/me",
        refresh: "/auth/refresh",
    },
    users: {
        list: "/users",
        create: "/users",
        detail: (id: string) => `/users/${id}`,
        update: (id: string) => `/users/${id}`,
        delete: (id: string) => `/users/${id}`,
        meSettings: "/users/me/settings",
        meProfile: "/users/me/profile",
    },
    baseUrl: import.meta.env.VITE_API_URL as string,
};
