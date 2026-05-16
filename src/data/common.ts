export const APP_NAME = "Twindix Performance Indicator";
export const APP_DESCRIPTION = "Team performance and delivery friction tracking platform";
export const DEMO_USERS = [
  { role: "OWNER",   email: "owner@twindix.com",   password: "password" },
  { role: "ADMIN",   email: "admin@twindix.com",   password: "password" },
  { role: "MANAGER", email: "manager@twindix.com", password: "password" },
  { role: "TESTER",  email: "tester@twindix.com",  password: "password" },
  { role: "MEMBER",  email: "member@twindix.com",  password: "password" },
  { role: "VIEWER",  email: "viewer@twindix.com",  password: "password" },
];

export const commonData = {
    appName: "Twindix Performance Indicator",
    brandName: "Twindix",
    cookie: {
        expiredDate: "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/",
        expiresPrefix: "; expires=",
        pathSuffix: "; path=/",
    },
    token: {
        authorizationHeader: "Authorization",
        bearerPrefix: "Bearer ",
        tokenKey: "twindix_performance_indicator_token",
    },
};
