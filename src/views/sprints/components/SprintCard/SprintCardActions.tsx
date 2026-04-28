import { Edit, MoreHorizontal, Trash2, Zap } from "lucide-react";

import { t } from "@/hooks";
import type { SprintCardActionsPropsInterface } from "@/interfaces";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/ui";

export const SprintCardActions = ({
    isActive,
    permissions,
    onEdit,
    onDelete,
    onActivate,
}: SprintCardActionsPropsInterface) => {
    const showActivate = !isActive && permissions.canActivate;
    if (!permissions.canEdit && !permissions.canDelete && !showActivate) return null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="p-1.5 rounded hover:bg-muted text-text-muted hover:text-text-dark cursor-pointer">
                    <MoreHorizontal className="h-4 w-4" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {showActivate && (
                    <>
                        <DropdownMenuItem onClick={onActivate} className="gap-2 cursor-pointer">
                            <Zap className="h-4 w-4" />{t("Activate")}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                    </>
                )}
                {permissions.canEdit && (
                    <DropdownMenuItem onClick={onEdit} className="gap-2 cursor-pointer">
                        <Edit className="h-4 w-4" />{t("Edit")}
                    </DropdownMenuItem>
                )}
                {permissions.canDelete && (
                    <DropdownMenuItem onClick={onDelete} className="gap-2 text-error focus:text-error cursor-pointer">
                        <Trash2 className="h-4 w-4" />{t("Delete")}
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
