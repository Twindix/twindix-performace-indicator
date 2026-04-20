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
