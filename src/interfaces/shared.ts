import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export interface SelectFieldOptionInterface {
    value: string;
    label: string;
}

export interface SelectFieldPropsInterface {
    value: string;
    onChange: (value: string) => void;
    options: SelectFieldOptionInterface[];
    placeholder?: string;
    triggerClassName?: string;
    id?: string;
}

export interface PageHeaderRootPropsInterface {
    title: string;
    description?: string;
    children?: ReactNode;
}

export interface PageHeaderAnalyticItemInterface {
    icon: LucideIcon;
    value: number;
    label: string;
    valueClassName?: string;
    iconWrapperClassName?: string;
    iconClassName?: string;
}
