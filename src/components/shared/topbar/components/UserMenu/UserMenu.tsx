import type { UserMenuPropsInterface } from "@/interfaces";
import { DropdownMenu, DropdownMenuContent, DropdownMenuSeparator, DropdownMenuTrigger } from "@/ui";

import { PresenceStatusMenuItems } from "./PresenceStatusMenuItems";
import { UserMenuActions } from "./UserMenuActions";
import { UserMenuHeader } from "./UserMenuHeader";
import { UserMenuTrigger } from "./UserMenuTrigger";

export const UserMenu = ({
    user,
    isArabic,
    canEditProfile,
    presence,
    actions,
}: UserMenuPropsInterface) => (
    <DropdownMenu dir={isArabic ? "rtl" : "ltr"}>
        <DropdownMenuTrigger asChild>
            <div>
                <UserMenuTrigger user={user} presenceStatus={presence.status} />
            </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
            <UserMenuHeader name={user?.full_name} email={user?.email} />
            <DropdownMenuSeparator />

            <PresenceStatusMenuItems
                visible={canEditProfile}
                currentStatus={presence.status}
                onChange={presence.onChange}
            />

            {canEditProfile && <DropdownMenuSeparator />}

            <UserMenuActions
                onLogout={actions.onLogout}
                onNavigateProfile={actions.onNavigateProfile}
                onNavigateSettings={actions.onNavigateSettings}
            />
        </DropdownMenuContent>
    </DropdownMenu>
);
