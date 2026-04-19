export const apisData = {
    auth: {
        login: "/auth/login",
        me: "/auth/me",
        refresh: "/auth/refresh",
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
