import { Calendar, Check, X } from "lucide-react";

import { Badge, Button } from "@/atoms";
import { EntityCard } from "@/components/shared";
import { decisionsConstants } from "@/constants";
import { DecisionStatus } from "@/enums";
import { t } from "@/hooks";
import type { DecisionCardPropsInterface } from "@/interfaces/decisions";
import { Avatar, AvatarFallback } from "@/ui";
import { formatDate } from "@/utils";

export const DecisionCard = ({ decision, canSetStatus, compact, onView, onSetStatus }: DecisionCardPropsInterface) => {
    const creator = decision.created_by;
    const isPending = decision.status === DecisionStatus.Pending;

    return (
        <EntityCard
            className="cursor-pointer hover:border-primary/40 transition-colors"
            contentClassName={compact ? "p-3" : "p-5"}
            onClick={() => onView(decision)}
        >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4 mb-3">
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-text-dark mb-1">{decision.title}</h3>
                    {decision.description && (
                        <p className="text-xs text-text-secondary line-clamp-2">{decision.description}</p>
                    )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={decisionsConstants.statusVariants[decision.status]}>
                        {t(decisionsConstants.statusLabels[decision.status])}
                    </Badge>
                    {decision.category && (
                        <Badge variant="outline">{t(decisionsConstants.categoryLabels[decision.category])}</Badge>
                    )}
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted">
                {creator && (
                    <div className="flex items-center gap-1.5">
                        <Avatar className="h-5 w-5">
                            <AvatarFallback className="text-[8px]">{creator.avatar_initials}</AvatarFallback>
                        </Avatar>
                        <span>{creator.full_name}</span>
                    </div>
                )}
                <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(decision.created_at)}</span>
                </div>
                {decision.decided_at && (
                    <span>{t("Decided")}: {formatDate(decision.decided_at)}</span>
                )}
            </div>

            {decision.outcome && (
                <div className="mt-3 rounded-lg bg-muted p-2.5">
                    <p className="text-xs text-text-secondary">
                        <span className="font-medium text-text-dark">{t("Outcome")}: </span>
                        {decision.outcome}
                    </p>
                </div>
            )}

            {canSetStatus && isPending && (
                <EntityCard.Footer onClick={(e) => e.stopPropagation()}>
                    <span className="text-xs text-text-muted flex-1">{t("Awaiting PM approval")}</span>
                    <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-3 gap-1 text-xs border-error text-error hover:bg-error-light"
                        onClick={() => onSetStatus(decision.id, DecisionStatus.Rejected)}
                    >
                        <X className="h-3 w-3" /> {t("Reject")}
                    </Button>
                    <Button
                        size="sm"
                        className="h-7 px-3 gap-1 text-xs"
                        onClick={() => onSetStatus(decision.id, DecisionStatus.Approved)}
                    >
                        <Check className="h-3 w-3" /> {t("Approve")}
                    </Button>
                </EntityCard.Footer>
            )}
        </EntityCard>
    );
};
