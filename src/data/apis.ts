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
<<<<<<< HEAD
    decisions: {
        list: (sprintId: string) => `/sprints/${sprintId}/decisions`,
        analytics: (sprintId: string) => `/sprints/${sprintId}/decisions/analytics`,
        create: (sprintId: string) => `/sprints/${sprintId}/decisions`,
        detail: (id: string) => `/decisions/${id}`,
        update: (id: string) => `/decisions/${id}`,
        delete: (id: string) => `/decisions/${id}`,
=======
    dashboard: {
        full: (sprintId: string) => `/sprints/${sprintId}/dashboard`,
        healthScore: (sprintId: string) => `/sprints/${sprintId}/dashboard/health-score`,
        metrics: (sprintId: string) => `/sprints/${sprintId}/dashboard/metrics`,
>>>>>>> feat/integrate-dashboard
    },
    baseUrl: import.meta.env.VITE_API_URL as string,
};
