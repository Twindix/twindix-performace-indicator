import { Edit, MoreHorizontal, Trash2 } from "lucide-react";

import { Button } from "@/atoms";
import { t } from "@/hooks";
import type { ProjectCardActionsPropsInterface } from "@/interfaces";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/ui";

export const ProjectActions = ({ canEdit, canDelete, onEdit, onDelete }: ProjectCardActionsPropsInterface) => {
    if (!canEdit && !canDelete) return null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {canEdit && (
                    <DropdownMenuItem onClick={onEdit} className="gap-2 cursor-pointer">
                        <Edit className="h-4 w-4" /> {t("Edit")}
                    </DropdownMenuItem>
                )}
                {canEdit && canDelete && <DropdownMenuSeparator />}
                {canDelete && (
                    <DropdownMenuItem onClick={onDelete} className="gap-2 text-error focus:text-error cursor-pointer">
                        <Trash2 className="h-4 w-4" /> {t("Delete")}
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
