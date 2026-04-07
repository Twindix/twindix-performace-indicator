import type { HTMLAttributes } from "react";

import { cn } from "@/utils";

export const Skeleton = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("animate-pulse rounded-[var(--radius-default)] bg-muted", className)} {...props} />
);
