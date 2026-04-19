export const apisData = {
    auth: {
        login: "/auth/login",
        me: "/auth/me",
        refresh: "/auth/refresh",
    },
    dashboard: {
        full: (sprintId: string) => `/sprints/${sprintId}/dashboard`,
        healthScore: (sprintId: string) => `/sprints/${sprintId}/dashboard/health-score`,
        metrics: (sprintId: string) => `/sprints/${sprintId}/dashboard/metrics`,
    },
    baseUrl: import.meta.env.VITE_API_URL as string,
};
