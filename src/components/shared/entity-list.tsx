import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/utils";

import { EmptyState } from "./empty-state";

interface EntityListProps<T> {
    items: T[];
    renderItem: (item: T) => ReactNode;
    emptyIcon?: LucideIcon;
    emptyTitle?: string;
    emptyDescription?: string;
    className?: string;
}

export const EntityList = <T,>({
    items,
    renderItem,
    emptyIcon,
    emptyTitle = "",
    emptyDescription = "",
    className,
}: EntityListProps<T>) =>
    items.length === 0 && emptyIcon ? (
        <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} />
    ) : (
        <div className={cn("flex flex-col gap-3", className)}>{items.map(renderItem)}</div>
    );
