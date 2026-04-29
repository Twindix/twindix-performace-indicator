import { Calendar, Clock, Layers } from "lucide-react";

import { Badge } from "@/atoms";
import { EntityCard } from "@/components/shared";
import { blockersConstants } from "@/constants";
import { t } from "@/hooks";
import type {
    BlockerCardHeaderPropsInterface,
    BlockerCardMetaPropsInterface,
    BlockerCardPropsInterface,
} from "@/interfaces";
import { Avatar, AvatarFallback } from "@/ui";
import { cn, formatDate } from "@/utils";

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const BlockerHeader = ({ type, title, description, status, severity }: BlockerCardHeaderPropsInterface) => {
    const typeInfo = blockersConstants.typeConfig[type] ?? blockersConstants.fallbackTypeInfo;
    const TypeIcon = typeInfo.icon;
    const severityVariant = blockersConstants.severityVariants[severity] ?? "secondary";
    const statusVariant = status ? (blockersConstants.statusVariants[status] ?? "secondary") : "secondary";
    const [bgClass, textClass] = typeInfo.color.split(" ");

    return (
        <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-start gap-3 min-w-0">
                <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", bgClass)}>
                    <TypeIcon className={cn("h-4 w-4", textClass)} />
                </div>
                <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-text-dark truncate">{title}</h3>
                    {description && <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">{description}</p>}
                </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
                {status && <Badge variant={statusVariant}>{t(capitalize(status))}</Badge>}
                <Badge variant={severityVariant}>{t(capitalize(severity))}</Badge>
            </div>
        </div>
    );
};

export const BlockerMeta = ({ reporter, owner, durationDays, createdAt, tasksAffected }: BlockerCardMetaPropsInterface) => (
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

export const BlockerCard = ({ blocker, compact, onClick }: BlockerCardPropsInterface) => (
    <EntityCard
        className="overflow-hidden cursor-pointer"
        contentClassName={compact ? "p-3" : "p-5"}
        onClick={onClick}
    >
        <BlockerHeader
            type={blocker.type}
            title={blocker.title}
            description={blocker.description}
            status={blocker.status}
            severity={blocker.severity}
        />
        <BlockerMeta
            reporter={blocker.reporter}
            owner={blocker.owner}
            durationDays={blocker.duration_days}
            createdAt={blocker.created_at}
            tasksAffected={blocker.tasks_affected}
        />
    </EntityCard>
);
