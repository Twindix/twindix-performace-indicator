import type { ReactNode } from "react";

interface QueryBoundaryProps {
    isLoading: boolean;
    skeleton: ReactNode;
    empty?: boolean;
    emptyState?: ReactNode;
    children: ReactNode;
}

export const QueryBoundary = ({ isLoading, skeleton, empty = false, emptyState, children }: QueryBoundaryProps) => {
    if (isLoading) return <>{skeleton}</>;
    if (empty && emptyState) return <>{emptyState}</>;
    return <>{children}</>;
};
