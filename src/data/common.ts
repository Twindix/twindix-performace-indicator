export const APP_NAME = "Twindix Performance Indicator";
export const APP_DESCRIPTION = "Team performance and delivery friction tracking platform";
export const DEMO_USERS = [
  {
    role: "ADMIN",
    email: "admin@example.com",
    password: "Admin@123"
  },
  {
    role: "MANAGER",
    email: "manager@example.com",
    password: "Manager@123"
  },
  {
    role: "MEMBER",
    email: "member@example.com",
    password: "Member@123"
  },
  {
    role: "VIEWER",
    email: "viewer@example.com",
    password: "Viewer@123"
  },
  {
    role: "TESTER",
    email: "tester@example.com",
    password: "Tester@123"
  }
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
