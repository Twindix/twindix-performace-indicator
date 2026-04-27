import type { ProfileInfoRowPropsInterface } from "@/interfaces/profile";

export const ProfileInfoRow = ({ icon: Icon, children }: ProfileInfoRowPropsInterface) => (
    <div className="flex items-center gap-3 text-sm text-text-secondary">
        <Icon className="h-4 w-4 text-text-muted" />
        <span>{children}</span>
    </div>
);
