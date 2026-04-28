import { Calendar, Clock, Layers } from "lucide-react";

import { t } from "@/hooks";
import type { BlockerCardMetaPropsInterface } from "@/interfaces";
import { Avatar, AvatarFallback } from "@/ui";
import { formatDate } from "@/utils";

export const BlockerCardMeta = ({
    reporter,
    owner,
    durationDays,
    createdAt,
    tasksAffected,
}: BlockerCardMetaPropsInterface) => (
    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-text-muted">
        {reporter && (
            <div className="flex items-center gap-1.5">
                <Avatar className="h-5 w-5">
                    <AvatarFallback className="text-[8px]">{reporter.avatar_initials}</AvatarFallback>
                </Avatar>
                <span>{t("Reported by")} <span className="font-medium text-text-secondary">{reporter.full_name}</span></span>
            </div>
        )}
        {owner && (
            <div className="flex items-center gap-1.5">
                <Avatar className="h-5 w-5">
                    <AvatarFallback className="text-[8px]">{owner.avatar_initials}</AvatarFallback>
                </Avatar>
                <span>{t("Owned by")} <span className="font-medium text-text-secondary">{owner.full_name}</span></span>
            </div>
        )}
        {durationDays !== null && (
            <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{durationDays} {t("days")}</span>
            </div>
        )}
        <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(createdAt)}</span>
        </div>
        {Number(tasksAffected ?? 0) > 0 && (
            <div className="flex items-center gap-1">
                <Layers className="h-3 w-3" />
                <span>{tasksAffected} {t("tasks affected")}</span>
            </div>
        )}
    </div>
);
