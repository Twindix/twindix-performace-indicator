import { createBrowserRouter } from "react-router-dom";

import { routesData } from "@/data";
import { AuthLayout, DashboardLayout } from "@/layouts";
import {
    AlertsView,
    AnalyticsView,
    BlockerView,
    CommentsLogView,
    CommunicationView,
    DashboardView,
    DecisionsView,
    HandoffsView,
    LoginView,
    NotFoundView,
    OwnershipView,
    ProfileView,
    RedFlagsView,
    ServerErrorView,
    SettingsView,
    TasksView,
    UserDetailView,
    UsersView,
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
                            { path: routesData.tasks, element: <TasksView /> },
                            { path: routesData.blockers, element: <BlockerView /> },
                            { path: routesData.decisions, element: <DecisionsView /> },
                            { path: routesData.communication, element: <CommunicationView /> },
                            { path: routesData.workload, element: <WorkloadView /> },
                            { path: routesData.analytics, element: <AnalyticsView /> },
                            { path: routesData.ownership, element: <OwnershipView /> },
                            { path: routesData.handoffs, element: <HandoffsView /> },
                            { path: routesData.users, element: <UsersView /> },
                            { path: routesData.userDetail, element: <UserDetailView /> },
                            { path: routesData.commentsLog, element: <CommentsLogView /> },
                            { path: routesData.redFlags, element: <RedFlagsView /> },
                            { path: routesData.alerts, element: <AlertsView /> },
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
