import { AlertCircle, CheckCircle2, TrendingUp } from "lucide-react";

import { Badge, Button } from "@/atoms";
import { t } from "@/hooks";
import type { BlockerDetailActionsPropsInterface } from "@/interfaces";
import { formatDate } from "@/utils";

export const BlockerDetailActions = ({
    status,
    permissions,
    busy,
    onResolve,
    onEscalate,
}: BlockerDetailActionsPropsInterface) => (
    <div className="flex items-center gap-2 mt-4">
        {!status.isResolved ? (
            <>
                {permissions.canResolve && (
                    <Button onClick={onResolve} loading={busy.resolving} className="gap-1.5">
                        {!busy.resolving && <CheckCircle2 className="h-4 w-4" />}
                        {t("Mark as Resolved")}
                    </Button>
                )}
                {!status.isEscalated && permissions.canEscalate && (
                    <Button variant="outline" onClick={onEscalate} loading={busy.escalating} className="gap-1.5 border-warning text-warning hover:bg-warning-light">
                        {!busy.escalating && <TrendingUp className="h-4 w-4" />}
                        {t("Escalate")}
                    </Button>
                )}
            </>
        ) : (
            <div className="flex items-center gap-1.5 text-success">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm font-medium">
                    {t("Resolved")}
                    {status.resolvedAt && <> · {formatDate(status.resolvedAt)}</>}
                </span>
            </div>
        )}
        {status.isEscalated && (
            <Badge variant="warning" className="gap-1 ms-auto">
                <AlertCircle className="h-3 w-3" />
                {t("Escalated")}
            </Badge>
        )}
    </div>
);
