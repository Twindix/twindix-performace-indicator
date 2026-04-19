import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "@/hooks";
import { routesData } from "@/data";

export const ProtectedRoute = () => {
    const { isAuthenticated, isLoading } = useAuth();
    if (isLoading) return null;
    if (!isAuthenticated) return <Navigate to={routesData.login} replace />;
    return <Outlet />;
};
