export const apisData = {
    auth: {
        login: "/auth/login",
        me: "/auth/me",
        refresh: "/auth/refresh",
    },
    decisions: {
        list: (sprintId: string) => `/sprints/${sprintId}/decisions`,
        create: (sprintId: string) => `/sprints/${sprintId}/decisions`,
        detail: (id: string) => `/decisions/${id}`,
        update: (id: string) => `/decisions/${id}`,
        delete: (id: string) => `/decisions/${id}`,
    },
    baseUrl: import.meta.env.VITE_API_URL as string,
};
