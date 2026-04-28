import { Calendar } from "lucide-react";

import { Badge } from "@/atoms";
import { t } from "@/hooks";
import type { SprintCardDateRangePropsInterface, SprintCardHeaderPropsInterface, SprintStatusBadgePropsInterface } from "@/interfaces";
import { getSprintBadge } from "@/lib/sprints";

export const SprintStatusBadge = ({ status }: SprintStatusBadgePropsInterface) => {
    const { label, variant } = getSprintBadge(status);
    return <Badge variant={variant}>{t(label)}</Badge>;
};

export const SprintHeader = ({ sprint }: SprintCardHeaderPropsInterface) => (
    <div className="flex-1 min-w-0">
        <h3 className="text-base font-semibold text-text-dark truncate">{sprint.name}</h3>
        <div className="mt-1">
            <SprintStatusBadge status={sprint.status} />
        </div>
    </div>
);

export const SprintDateRange = ({ startDate, endDate }: SprintCardDateRangePropsInterface) => (
    <div className="flex items-center gap-2 text-xs text-text-muted">
        <Calendar className="h-3.5 w-3.5" />
        <span>{startDate} → {endDate}</span>
    </div>
);
