export const apisData = {
    auth: {
        login: "/auth/login",
        me: "/auth/me",
        refresh: "/auth/refresh",
    },
    comments: {
        list: (sprintId: string) => `/sprints/${sprintId}/comments`,
        analytics: (sprintId: string) => `/sprints/${sprintId}/comments/analytics`,
        create: (sprintId: string) => `/sprints/${sprintId}/comments`,
        detail: (id: string) => `/comments/${id}`,
        update: (id: string) => `/comments/${id}`,
        delete: (id: string) => `/comments/${id}`,
        respond: (id: string) => `/comments/${id}/respond`,
    },
    baseUrl: import.meta.env.VITE_API_URL as string,
};
