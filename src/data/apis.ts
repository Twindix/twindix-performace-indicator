export const apisData = {
    auth: {
        login: "/auth/login",
        logout: "/auth/logout",
        refresh: "/auth/refresh",
        me: "/auth/me",
        heartbeat: "/auth/heartbeat",
    },
    teams: {
        list: "/teams",
        create: "/teams",
    },
    baseUrl: import.meta.env.VITE_API_URL as string,
};
