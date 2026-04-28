import type { MouseEvent, ReactNode } from "react";

import { Card, CardContent } from "@/atoms";
import { cn } from "@/utils";

interface RootProps {
    children: ReactNode;
    className?: string;
    contentClassName?: string;
    onClick?: () => void;
}

interface SlotProps {
    children: ReactNode;
    className?: string;
    onClick?: (e: MouseEvent) => void;
}

const Row = ({ children, className }: SlotProps) => (
    <div className={cn("flex items-start justify-between gap-3", className)}>
        {children}
    </div>
);

const Meta = ({ children, className }: SlotProps) => (
    <div className={cn("flex flex-wrap items-center gap-3 text-xs text-text-muted", className)}>
        {children}
    </div>
);

const Body = ({ children, className, onClick }: SlotProps) => (
    <p className={cn("text-sm text-text-dark", className)} onClick={onClick}>{children}</p>
);

const Footer = ({ children, className, onClick }: SlotProps) => (
    <div className={cn("mt-3 pt-3 border-t border-border flex items-center gap-2", className)} onClick={onClick}>
        {children}
    </div>
);

const EntityCardRoot = ({ children, className, contentClassName, onClick }: RootProps) => (
    <Card className={cn("hover:shadow-md transition-shadow", className)} onClick={onClick}>
        <CardContent className={cn("p-4", contentClassName)}>
            {children}
        </CardContent>
    </Card>
);

export const EntityCard = Object.assign(EntityCardRoot, { Row, Meta, Body, Footer });
