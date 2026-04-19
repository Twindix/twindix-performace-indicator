export const apisData = {
    auth: {
        login: "/auth/login",
        me: "/auth/me",
        refresh: "/auth/refresh",
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
