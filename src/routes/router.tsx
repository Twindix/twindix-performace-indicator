import { createBrowserRouter } from "react-router-dom";

import { routesData } from "@/data";
import { AuthLayout, DashboardLayout } from "@/layouts";
import {
    DashboardView,
    LoginView,
    NotFoundView,
    ProfileView,
    RedFlagsView,
    ServerErrorView,
    SettingsView,
    SprintsView,
} from "@/views";

import { RouteError } from "./error";
import { ProtectedRoute } from "./protected";
import { PublicRoute } from "./public";

export const router = createBrowserRouter([
    {
        element: <PublicRoute />,
        children: [
            {
                element: <AuthLayout />,
                children: [
                    { path: routesData.login, element: <LoginView /> },
                ],
            },
        ],
    },
    {
        element: <ProtectedRoute />,
        children: [
            {
                element: <DashboardLayout />,
                children: [
                    {
                        errorElement: <RouteError />,
                        children: [
                            { path: routesData.dashboard, element: <DashboardView /> },
                            { path: routesData.sprints, element: <SprintsView /> },
                            { path: routesData.redFlags, element: <RedFlagsView /> },
                            { path: routesData.profile, element: <ProfileView /> },
                            { path: routesData.settings, element: <SettingsView /> },
                        ],
                    },
                ],
            },
        ],
    },
    { path: "/500", element: <ServerErrorView /> },
    { path: "*", element: <NotFoundView /> },
]);
