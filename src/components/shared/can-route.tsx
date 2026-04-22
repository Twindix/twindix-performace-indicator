import type { ReactNode } from "react";
import { Navigate, Outlet } from "react-router-dom";

import type { RoleTier } from "@/constants/permissions";
import { routesData } from "@/data";
import { useAuth } from "@/hooks";

export interface CanRouteProps {
    allow: readonly RoleTier[];
    redirectTo?: string;
    children?: ReactNode;
}

export const CanRoute = ({ allow, redirectTo = routesData.dashboard, children }: CanRouteProps) => {
    const { user, isLoading } = useAuth();

    if (isLoading) return null;
    if (!user || !allow.includes(user.role_tier)) {
        return <Navigate to={redirectTo} replace />;
    }

    return <>{children ?? <Outlet />}</>;
};
