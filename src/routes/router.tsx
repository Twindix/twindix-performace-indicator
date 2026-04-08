import { createBrowserRouter } from "react-router-dom";

import { routesData } from "@/data";
import { AuthLayout, DashboardLayout } from "@/layouts";
import {
    AnalyticsView,
    BlockerView,
    CommunicationView,
    DashboardView,
    DecisionsView,
    HandoffsView,
    LoginView,
    NotFoundView,
    OwnershipView,
    ProfileView,
    ReportsView,
    ServerErrorView,
    SettingsView,
    TasksView,
    WorkloadView,
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
                    { path: routesData.login.path, element: <LoginView /> },
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
                            { path: routesData.dashboard.path,     element: <DashboardView /> },
                            { path: routesData.tasks.path,         element: <TasksView /> },
                            { path: routesData.blockers.path,      element: <BlockerView /> },
                            { path: routesData.decisions.path,     element: <DecisionsView /> },
                            { path: routesData.communication.path, element: <CommunicationView /> },
                            { path: routesData.workload.path,      element: <WorkloadView /> },
                            { path: routesData.reports.path,       element: <ReportsView /> },
                            { path: routesData.analytics.path,     element: <AnalyticsView /> },
                            { path: routesData.ownership.path,     element: <OwnershipView /> },
                            { path: routesData.handoffs.path,      element: <HandoffsView /> },
                            { path: routesData.profile.path,       element: <ProfileView /> },
                            { path: routesData.settings.path,      element: <SettingsView /> },
                        ],
                    },
                ],
            },
        ],
    },
    { path: "/500", element: <ServerErrorView /> },
    { path: "*", element: <NotFoundView /> },
]);
