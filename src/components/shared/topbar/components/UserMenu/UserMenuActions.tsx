import { LogOut, Settings, User } from "lucide-react";

import { t } from "@/hooks";
import type { UserMenuActionsPropsInterface } from "@/interfaces";
import { DropdownMenuItem } from "@/ui";

export const UserMenuActions = ({
    onLogout,
    onNavigateProfile,
    onNavigateSettings,
}: UserMenuActionsPropsInterface) => (
    <>
        <DropdownMenuItem onClick={onNavigateProfile} className="gap-2 cursor-pointer">
            <User className="h-4 w-4" />
            {t("My Profile")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onNavigateSettings} className="gap-2 cursor-pointer">
            <Settings className="h-4 w-4" />
            {t("Settings")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onLogout} className="gap-2 text-error focus:text-error cursor-pointer">
            <LogOut className="h-4 w-4" />
            {t("Sign Out")}
        </DropdownMenuItem>
    </>
);
