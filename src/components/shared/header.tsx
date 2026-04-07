import { type ReactNode, useEffect } from "react";

import { t } from "@/hooks";

interface HeaderProps {
    title: string;
    description?: string;
    actions?: ReactNode;
}

export const Header = ({ title, description, actions }: HeaderProps) => {
    useEffect(() => {
        document.title = `${t("Twindix")} ${t("Performance Indicator")} | ${title}`;
        return () => { document.title = `${t("Twindix")} ${t("Performance Indicator")}`; };
    }, [title]);

    return (
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-6">
            <div>
                <h1 className="text-xl sm:text-2xl font-bold text-text-dark">{title}</h1>
                {description && <p className="text-xs sm:text-sm text-text-secondary mt-1">{description}</p>}
            </div>
            {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
        </div>
    );
};
