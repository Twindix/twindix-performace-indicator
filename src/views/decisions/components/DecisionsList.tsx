import type { DecisionsListPropsInterface } from "@/interfaces/decisions";
import { cn } from "@/utils";

import { DecisionCard } from "./DecisionCard";

export const DecisionsList = ({ decisions, canSetStatus, compact, onView, onSetStatus }: DecisionsListPropsInterface) => (
    <div className={cn("flex flex-col", compact ? "gap-2" : "gap-4")}>
        {decisions.map((decision) => (
            <DecisionCard
                key={decision.id}
                decision={decision}
                canSetStatus={canSetStatus}
                compact={compact}
                onView={onView}
                onSetStatus={onSetStatus}
            />
        ))}
    </div>
);
