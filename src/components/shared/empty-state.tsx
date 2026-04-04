import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
}

export const EmptyState = ({ icon: Icon, title, description }: EmptyStateProps) => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
            <Icon className="h-8 w-8 text-text-muted" />
        </div>
        <h3 className="text-lg font-semibold text-text-dark mb-1">{title}</h3>
        <p className="text-sm text-text-secondary max-w-sm">{description}</p>
    </div>
);
