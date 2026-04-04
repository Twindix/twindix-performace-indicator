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
    OwnershipView,
    ProfileView,
    ReportsView,
    SettingsView,
    TasksView,
    WorkloadView,
} from "@/views";

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
                    { path: routesData.dashboard, element: <DashboardView /> },
                    { path: routesData.tasks, element: <TasksView /> },
                    { path: routesData.blockers, element: <BlockerView /> },
                    { path: routesData.decisions, element: <DecisionsView /> },
                    { path: routesData.communication, element: <CommunicationView /> },
                    { path: routesData.workload, element: <WorkloadView /> },
                    { path: routesData.reports, element: <ReportsView /> },
                    { path: routesData.analytics, element: <AnalyticsView /> },
                    { path: routesData.ownership, element: <OwnershipView /> },
                    { path: routesData.handoffs, element: <HandoffsView /> },
                    { path: routesData.profile, element: <ProfileView /> },
                    { path: routesData.settings, element: <SettingsView /> },
                ],
            },
        ],
    },
]);
