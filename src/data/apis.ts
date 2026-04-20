export const apisData = {
    auth: {
        login: "/auth/login",
        logout: "/auth/logout",
        refresh: "/auth/refresh",
        me: "/auth/me",
        heartbeat: "/auth/heartbeat",
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
    redFlags: {
        list: (sprintId: string) => `/sprints/${sprintId}/red-flags`,
        count: (sprintId: string) => `/sprints/${sprintId}/red-flags/count`,
        create: (sprintId: string) => `/sprints/${sprintId}/red-flags`,
        detail: (id: string) => `/red-flags/${id}`,
        update: (id: string) => `/red-flags/${id}`,
        delete: (id: string) => `/red-flags/${id}`,
    },
    baseUrl: import.meta.env.VITE_API_URL as string,
};
