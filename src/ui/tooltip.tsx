import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { type ComponentPropsWithoutRef, forwardRef } from "react";

import { cn } from "@/utils";

export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export const TooltipContent = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>>(({ className, sideOffset = 4, ...props }, ref) => (
    <TooltipPrimitive.Content ref={ref} sideOffset={sideOffset} className={cn("z-50 overflow-hidden rounded-lg border border-border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95", className)} {...props} />
));
TooltipContent.displayName = "TooltipContent";
