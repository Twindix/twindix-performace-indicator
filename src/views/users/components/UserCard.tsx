import { ArrowRight, MoreHorizontal, PowerOff, Zap } from "lucide-react";

import { Badge, Card, CardContent } from "@/atoms";
import { t } from "@/hooks";
import type { UserCardPropsInterface } from "@/interfaces/users";
import {
    Avatar, AvatarFallback,
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/ui";

export const UserCard = ({ user, canEdit, onToggleStatus, onView }: UserCardPropsInterface) => {
    const isInactive = user.account_status === "inactive";
    const teamName = typeof user.team === "string" ? user.team : user.team?.name;

    return (
        <Card className={`hover:shadow-md transition-shadow ${isInactive ? "opacity-60" : ""}`}>
            <CardContent className="p-4">
                <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10 shrink-0">
                        <AvatarFallback className="text-sm font-semibold">{user.avatar_initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-text-dark">{user.full_name}</p>
                            <Badge variant="outline" className="text-xs">{user.role_label}</Badge>
                            {teamName && <Badge variant="secondary" className="text-xs">{teamName}</Badge>}
                            {isInactive && <Badge variant="error" className="text-xs">{t("Inactive")}</Badge>}
                        </div>
                        <p className="text-xs text-text-muted mt-0.5">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                        {canEdit && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="p-1.5 rounded-md text-text-muted hover:text-text-dark hover:bg-accent transition-colors cursor-pointer">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-44">
                                    <DropdownMenuItem
                                        className="gap-2 cursor-pointer"
                                        onClick={() => onToggleStatus(user)}
                                    >
                                        {isInactive
                                            ? <><Zap className="h-4 w-4 text-success" />{t("Activate")}</>
                                            : <><PowerOff className="h-4 w-4 text-warning" />{t("Deactivate")}</>
                                        }
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                        <button
                            onClick={() => onView(user.id)}
                            className="p-1.5 rounded-md text-text-muted hover:text-primary hover:bg-primary-lighter transition-colors cursor-pointer"
                        >
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
