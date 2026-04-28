import type { LucideIcon, LucideProps } from "lucide-react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import type { MouseEvent, ReactNode } from "react";

import { Card, CardContent } from "@/atoms";
import { t } from "@/hooks";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/ui";
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

interface ActionsProps {
    canEdit?: boolean;
    canDelete?: boolean;
    onEdit?: () => void;
    onDelete?: () => void;
}

interface MenuItem {
    label: string;
    icon?: (props: LucideProps) => ReactNode;
    onSelect: () => void;
    danger?: boolean;
}

interface MenuProps {
    items: MenuItem[];
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

const Actions = ({ canEdit, canDelete, onEdit, onDelete }: ActionsProps) => (
    <div className="flex items-center gap-1 shrink-0">
        {canEdit && (
            <button onClick={onEdit} className="p-1.5 rounded hover:bg-muted text-text-muted hover:text-primary cursor-pointer">
                <Pencil className="h-3.5 w-3.5" />
            </button>
        )}
        {canDelete && (
            <button onClick={onDelete} className="p-1.5 rounded hover:bg-error-light text-text-muted hover:text-error cursor-pointer">
                <Trash2 className="h-3.5 w-3.5" />
            </button>
        )}
    </div>
);

const Menu = ({ items }: MenuProps) => {
    if (items.length === 0) return null;
    const safeItems = items.filter((i) => !i.danger);
    const dangerItems = items.filter((i) => i.danger);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    className="p-1.5 rounded hover:bg-muted text-text-muted hover:text-text-dark cursor-pointer shrink-0"
                    onClick={(e) => e.stopPropagation()}
                >
                    <MoreHorizontal className="h-4 w-4" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {safeItems.map((item) => (
                    <DropdownMenuItem key={item.label} onClick={item.onSelect} className="gap-2 cursor-pointer">
                        {item.icon && <item.icon className="h-4 w-4" />}
                        {t(item.label)}
                    </DropdownMenuItem>
                ))}
                {safeItems.length > 0 && dangerItems.length > 0 && <DropdownMenuSeparator />}
                {dangerItems.map((item) => (
                    <DropdownMenuItem key={item.label} onClick={item.onSelect} className="gap-2 text-error focus:text-error cursor-pointer">
                        {item.icon && <item.icon className="h-4 w-4" />}
                        {t(item.label)}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

const EntityCardRoot = ({ children, className, contentClassName, onClick }: RootProps) => (
    <Card className={cn("hover:shadow-md transition-shadow", className)} onClick={onClick}>
        <CardContent className={cn("p-4", contentClassName)}>
            {children}
        </CardContent>
    </Card>
);

export const EntityCard = Object.assign(EntityCardRoot, { Row, Meta, Body, Footer, Actions, Menu });
export type { MenuItem as EntityCardMenuItem };
