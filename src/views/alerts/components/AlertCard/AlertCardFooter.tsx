import { Check, CheckCheck, ExternalLink } from "lucide-react";

import { Button } from "@/atoms";
import { t } from "@/hooks";
import type { AlertCardFooterPropsInterface } from "@/interfaces";

export const AlertCardFooter = ({
    isReviewTitle,
    sourceTaskId,
    counts,
    permissions,
    busy,
    actions,
}: AlertCardFooterPropsInterface) => (
    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
        <span className="text-xs text-text-muted">
            {t("Acknowledged")}: {counts.acknowledged}/{counts.total}
        </span>
        <div className="flex gap-1.5 ml-auto">
            {isReviewTitle && permissions.goToTask && (
                <Button
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={() => actions.onOpenTask(sourceTaskId)}
                >
                    <ExternalLink className="h-3 w-3" /> {t("Go to task")}
                </Button>
            )}
            {permissions.acknowledge && (
                <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs gap-1"
                    onClick={actions.onAcknowledge}
                    loading={busy.acknowledge}
                >
                    {!busy.acknowledge && <Check className="h-3 w-3" />} {t("Acknowledge")}
                </Button>
            )}
            {permissions.markDone && (
                <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs gap-1"
                    onClick={actions.onMarkDone}
                    loading={busy.markDone}
                >
                    {!busy.markDone && <CheckCheck className="h-3 w-3" />} {t("Done")}
                </Button>
            )}
        </div>
    </div>
);
