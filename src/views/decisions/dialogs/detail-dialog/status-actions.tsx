import { Check, X } from "lucide-react";

import { Button } from "@/atoms";
import { DecisionStatus } from "@/enums";
import { t } from "@/hooks";
import type { DecisionStatusActionsPropsInterface } from "@/interfaces/decisions";

export const DecisionStatusActions = ({ decision, onSetStatus }: DecisionStatusActionsPropsInterface) => (
    <div className="flex gap-2 mt-2 flex-wrap">
        {decision.status !== DecisionStatus.Approved && (
            <Button size="sm" className="gap-1" onClick={() => onSetStatus(decision.id, DecisionStatus.Approved)}>
                <Check className="h-3.5 w-3.5" /> {t("Approve")}
            </Button>
        )}
        {decision.status !== DecisionStatus.Rejected && (
            <Button
                size="sm"
                variant="outline"
                className="gap-1 border-error text-error hover:bg-error-light"
                onClick={() => onSetStatus(decision.id, DecisionStatus.Rejected)}
            >
                <X className="h-3.5 w-3.5" /> {t("Reject")}
            </Button>
        )}
        {decision.status !== DecisionStatus.Pending && (
            <Button
                size="sm"
                variant="outline"
                className="gap-1"
                onClick={() => onSetStatus(decision.id, DecisionStatus.Pending)}
            >
                {t("Set Pending")}
            </Button>
        )}
        {decision.status !== DecisionStatus.Deferred && (
            <Button
                size="sm"
                variant="outline"
                className="gap-1"
                onClick={() => onSetStatus(decision.id, DecisionStatus.Deferred)}
            >
                {t("Defer")}
            </Button>
        )}
    </div>
);
