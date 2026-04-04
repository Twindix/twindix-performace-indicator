import { type InputHTMLAttributes, forwardRef } from "react";

import { cn } from "@/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(({ className, type, ...props }, ref) => (
    <input
        type={type}
        className={cn(
            "flex h-10 w-full rounded-[var(--radius-default)] border border-input bg-surface px-3 py-2 text-sm text-text-dark placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
            className,
        )}
        ref={ref}
        {...props}
    />
));

Input.displayName = "Input";
