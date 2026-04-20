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
    alerts: {
        list: (sprintId: string) => `/sprints/${sprintId}/alerts`,
        count: (sprintId: string) => `/sprints/${sprintId}/alerts/count`,
        create: (sprintId: string) => `/sprints/${sprintId}/alerts`,
        detail: (id: string) => `/alerts/${id}`,
        update: (id: string) => `/alerts/${id}`,
        delete: (id: string) => `/alerts/${id}`,
        acknowledge: (id: string) => `/alerts/${id}/acknowledge`,
        done: (id: string) => `/alerts/${id}/done`,
    },
    baseUrl: import.meta.env.VITE_API_URL as string,
};
