export const apisData = {
    auth: {
        login: "/auth/login",
        me: "/auth/me",
        refresh: "/auth/refresh",
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
    baseUrl: import.meta.env.VITE_API_URL as string,
};
