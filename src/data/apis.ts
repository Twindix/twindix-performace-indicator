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
    dashboard: {
        full: (sprintId: string) => `/sprints/${sprintId}/dashboard`,
        healthScore: (sprintId: string) => `/sprints/${sprintId}/dashboard/health-score`,
        metrics: (sprintId: string) => `/sprints/${sprintId}/dashboard/metrics`,
    },
    baseUrl: import.meta.env.VITE_API_URL as string,
};
