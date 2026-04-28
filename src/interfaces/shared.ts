import type { LucideIcon } from "lucide-react";

export interface StatCardPropsInterface {
    icon: LucideIcon;
    value: number;
    label: string;
    iconWrapperClassName?: string;
    iconClassName?: string;
    valueClassName?: string;
}
