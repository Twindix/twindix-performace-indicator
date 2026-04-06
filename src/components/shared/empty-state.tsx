import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
}

export const EmptyState = ({ icon: Icon, title, description }: EmptyStateProps) => (
    <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center px-4">
        <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-muted mb-4">
            <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-text-muted" />
        </div>
        <h3 className="text-base sm:text-lg font-semibold text-text-dark mb-1">{title}</h3>
        <p className="text-xs sm:text-sm text-text-secondary max-w-sm">{description}</p>
    </div>
);
