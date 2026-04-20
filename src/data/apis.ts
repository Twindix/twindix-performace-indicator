export const apisData = {
    auth: {
        login: "/auth/login",
        logout: "/auth/logout",
        refresh: "/auth/refresh",
        me: "/auth/me",
        heartbeat: "/auth/heartbeat",
    },
    users: {
        list: "/users",
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
    blockers: {
        list: (sprintId: string) => `/sprints/${sprintId}/blockers`,
        analytics: (sprintId: string) => `/sprints/${sprintId}/blockers/analytics`,
        create: (sprintId: string) => `/sprints/${sprintId}/blockers`,
        detail: (id: string) => `/blockers/${id}`,
        update: (id: string) => `/blockers/${id}`,
        delete: (id: string) => `/blockers/${id}`,
        resolve: (id: string) => `/blockers/${id}/resolve`,
        escalate: (id: string) => `/blockers/${id}/escalate`,
        linkTasks: (id: string) => `/blockers/${id}/tasks`,
        unlinkTask: (id: string, taskId: string) => `/blockers/${id}/tasks/${taskId}`,
    },
    baseUrl: import.meta.env.VITE_API_URL as string,
};
