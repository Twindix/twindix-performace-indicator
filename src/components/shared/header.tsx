import { type ReactNode, useEffect } from "react";

import { t } from "@/utils";
import { useSettings } from "@/hooks";
import { cn } from "@/utils";

interface HeaderProps {
    title: string;
    description?: string;
    actions?: ReactNode;
}

export const Header = ({ title, description, actions }: HeaderProps) => {
    const [settings] = useSettings();
    const compact = settings.compactView;

    useEffect(() => {
        document.title = `${t("Twindix")} ${t("Performance Indicator")} | ${title}`;
        return () => { document.title = `${t("Twindix")} ${t("Performance Indicator")}`; };
    }, [title]);

    return (
        <div className={cn("flex flex-col sm:flex-row sm:items-start justify-between gap-3", compact ? "mb-3" : "mb-6")}>
            <div>
                <h1 className={cn("font-bold text-text-dark", compact ? "text-lg" : "text-xl sm:text-2xl")}>{title}</h1>
                {description && <p className={cn("text-text-secondary mt-1", compact ? "text-xs" : "text-xs sm:text-sm")}>{description}</p>}
            </div>
            {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
        </div>
    );
};
