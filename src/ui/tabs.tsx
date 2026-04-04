import * as TabsPrimitive from "@radix-ui/react-tabs";
import { type ComponentPropsWithoutRef, forwardRef } from "react";

import { cn } from "@/utils";

export const Tabs = TabsPrimitive.Root;

export const TabsList = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<typeof TabsPrimitive.List>>(({ className, ...props }, ref) => (
    <TabsPrimitive.List ref={ref} className={cn("inline-flex h-10 items-center justify-center rounded-[var(--radius-default)] bg-muted p-1 text-muted-foreground", className)} {...props} />
));
TabsList.displayName = "TabsList";

export const TabsTrigger = forwardRef<HTMLButtonElement, ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>>(({ className, ...props }, ref) => (
    <TabsPrimitive.Trigger ref={ref} className={cn("inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-surface data-[state=active]:text-text-dark data-[state=active]:shadow-sm cursor-pointer", className)} {...props} />
));
TabsTrigger.displayName = "TabsTrigger";

export const TabsContent = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<typeof TabsPrimitive.Content>>(({ className, ...props }, ref) => (
    <TabsPrimitive.Content ref={ref} className={cn("mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", className)} {...props} />
));
TabsContent.displayName = "TabsContent";
