import type { UserMenuHeaderPropsInterface } from "@/interfaces";

export const UserMenuHeader = ({ name, email }: UserMenuHeaderPropsInterface) => (
    <div className="px-2 py-2.5">
        <p className="text-sm font-semibold text-text-dark">{name}</p>
        <p className="text-xs text-text-muted">{email}</p>
    </div>
);
