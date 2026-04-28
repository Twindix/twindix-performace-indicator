import { Calendar } from "lucide-react";

import type { SprintCardDateRangePropsInterface } from "@/interfaces";

export const SprintCardDateRange = ({ startDate, endDate }: SprintCardDateRangePropsInterface) => (
    <div className="flex items-center gap-2 text-xs text-text-muted">
        <Calendar className="h-3.5 w-3.5" />
        <span>{startDate} → {endDate}</span>
    </div>
);
