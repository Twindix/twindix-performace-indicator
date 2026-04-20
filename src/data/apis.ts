export const apisData = {
    auth: {
        login: "/auth/login",
        logout: "/auth/logout",
        refresh: "/auth/refresh",
        me: "/auth/me",
        heartbeat: "/auth/heartbeat",
    },
    users: {
        list: "/users",
        detail: (id: string) => `/users/${id}`,
        create: "/users",
        update: (id: string) => `/users/${id}`,
        delete: (id: string) => `/users/${id}`,
        analytics: (id: string) => `/users/${id}/analytics`,
    },
    baseUrl: import.meta.env.VITE_API_URL as string,
};
