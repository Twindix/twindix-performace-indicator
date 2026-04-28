import { Edit, MoreHorizontal, Trash2, Users } from "lucide-react";

import { Button, Card, CardContent } from "@/atoms";
import { t } from "@/hooks";
import type { TeamCardPropsInterface } from "@/interfaces";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/ui";

export const TeamCard = ({ team, canManage, onClick, onEdit, onDelete }: TeamCardPropsInterface) => (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
        <CardContent className="p-5">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-lighter text-primary-medium shrink-0">
                    <Users className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-text-dark truncate flex-1">{team.name}</h3>
                {canManage && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={(e) => e.stopPropagation()}>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }} className="gap-2 cursor-pointer">
                                <Edit className="h-4 w-4" /> {t("Edit")}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete(); }} className="gap-2 text-error focus:text-error cursor-pointer">
                                <Trash2 className="h-4 w-4" /> {t("Delete")}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
        </CardContent>
    </Card>
);
