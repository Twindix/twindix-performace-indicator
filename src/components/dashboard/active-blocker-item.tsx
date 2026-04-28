import { AlertTriangle } from "lucide-react";

import { Badge } from "@/atoms";
import { t } from "@/hooks";
import type { ActiveBlockerItemPropsInterface } from "@/interfaces";
import { getBlockerSeverityBadge } from "@/lib/dashboard";

export const ActiveBlockerItem = ({ blocker }: ActiveBlockerItemPropsInterface) => {
    const severity = getBlockerSeverityBadge(blocker.severity);
    const days = Math.round(blocker.duration_days * 10) / 10;

    return (
        <div className="flex items-start gap-3 rounded-xl bg-error-light p-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-error/10">
                <AlertTriangle className="h-4 w-4 text-error" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-dark truncate">{blocker.title}</p>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-text-muted">{days} {t("days")} {t("blocked")}</span>
                    <Badge variant={severity.variant}>{t(severity.label)}</Badge>
                </div>
            </div>
        </div>
    );
};
