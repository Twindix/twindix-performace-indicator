import type { ReactNode } from "react";

interface HeaderProps {
    title: string;
    description?: string;
    actions?: ReactNode;
}

export const Header = ({ title, description, actions }: HeaderProps) => (
    <div className="flex items-start justify-between mb-6">
        <div>
            <h1 className="text-2xl font-bold text-text-dark">{title}</h1>
            {description && <p className="text-sm text-text-secondary mt-1">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
);
