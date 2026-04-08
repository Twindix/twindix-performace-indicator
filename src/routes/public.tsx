import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "@/hooks";
import { routesData } from "@/data";

export const PublicRoute = () => {
    const { isAuthenticated } = useAuth();
    if (isAuthenticated) return <Navigate to={routesData.dashboard} replace />;
    return <Outlet />;
};
