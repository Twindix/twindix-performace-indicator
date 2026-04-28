import { Calendar, Clock, User } from "lucide-react";

import { t } from "@/hooks";
import type { BlockerDetailMetaPropsInterface } from "@/interfaces";
import { Avatar, AvatarFallback } from "@/ui";
import { formatDate } from "@/utils";

export const BlockerDetailMeta = ({
    reporter,
    owner,
    createdAt,
    durationDays,
}: BlockerDetailMetaPropsInterface) => (
    <div className="grid grid-cols-2 gap-4 mt-4 pb-4 border-b border-border">
        {reporter && (
            <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-text-muted" />
                <div>
                    <p className="text-xs text-text-muted">{t("Reported by")}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <Avatar className="h-5 w-5"><AvatarFallback className="text-[8px]">{reporter.avatar_initials}</AvatarFallback></Avatar>
                        <span className="text-sm font-medium text-text-dark">{reporter.full_name}</span>
                    </div>
                </div>
            </div>
        )}
        {owner && (
            <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-text-muted" />
                <div>
                    <p className="text-xs text-text-muted">{t("Owned by")}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <Avatar className="h-5 w-5"><AvatarFallback className="text-[8px]">{owner.avatar_initials}</AvatarFallback></Avatar>
                        <span className="text-sm font-medium text-text-dark">{owner.full_name}</span>
                    </div>
                </div>
            </div>
        )}
        <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-text-muted" />
            <div>
                <p className="text-xs text-text-muted">{t("Created")}</p>
                <p className="text-sm font-medium text-text-dark">{formatDate(createdAt)}</p>
            </div>
        </div>
        {durationDays !== null && (
            <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-text-muted" />
                <div>
                    <p className="text-xs text-text-muted">{t("Duration")}</p>
                    <p className="text-sm font-medium text-text-dark">{durationDays} {t("days")}</p>
                </div>
            </div>
        )}
    </div>
);
