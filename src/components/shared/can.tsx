import type { ReactNode } from "react";

import { type Permissions, usePermissions } from "@/hooks";

export interface CanProps {
    check: (p: Permissions) => boolean;
    children: ReactNode;
    fallback?: ReactNode;
}

export const Can = ({ check, children, fallback = null }: CanProps) => {
    const permissions = usePermissions();
    return <>{check(permissions) ? children : fallback}</>;
};
