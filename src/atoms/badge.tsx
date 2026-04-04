import { type VariantProps, cva } from "class-variance-authority";
import type { HTMLAttributes } from "react";

import { cn } from "@/utils";

const badgeVariants = cva(
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
    {
        variants: {
            variant: {
                default: "bg-primary-lighter text-primary-medium",
                success: "bg-success-light text-success",
                warning: "bg-warning-light text-warning",
                error: "bg-error-light text-error",
                secondary: "bg-muted text-muted-foreground",
                outline: "border border-border text-text-secondary",
            },
        },
        defaultVariants: { variant: "default" },
    },
);

interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export const Badge = ({ className, variant, ...props }: BadgeProps) => (
    <span className={cn(badgeVariants({ variant, className }))} {...props} />
);
