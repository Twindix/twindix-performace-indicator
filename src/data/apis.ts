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
        create: "/users",
        detail: (id: string) => `/users/${id}`,
        update: (id: string) => `/users/${id}`,
        delete: (id: string) => `/users/${id}`,
        meSettings: "/users/me/settings",
        meProfile: "/users/me/profile",
    },
    teams: {
        list: "/teams",
        create: "/teams",
    },
    sprints: {
        list: "/sprints",
        create: "/sprints",
        detail: (id: string) => `/sprints/${id}`,
        update: (id: string) => `/sprints/${id}`,
        delete: (id: string) => `/sprints/${id}`,
        activate: (id: string) => `/sprints/${id}/activate`,
        summary: (id: string) => `/sprints/${id}/summary`,
    },
    baseUrl: import.meta.env.VITE_API_URL as string,
};
