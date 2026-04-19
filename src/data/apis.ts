export const apisData = {
    auth: {
        login: "/auth/login",
        me: "/auth/me",
        refresh: "/auth/refresh",
    },
    teams: {
        list: "/teams",
        create: "/teams",
    },
    baseUrl: import.meta.env.VITE_API_URL as string,
};
