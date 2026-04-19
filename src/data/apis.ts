export const apisData = {
    auth: {
        login: "/auth/login",
        logout: "/auth/logout",
        me: "/auth/me",
        heartbeat: "/auth/heartbeat",
    },
    baseUrl: import.meta.env.VITE_API_URL as string,
};
