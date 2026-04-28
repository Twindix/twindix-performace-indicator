import { t } from "@/hooks";
import type { HealthScoreSummaryPropsInterface } from "@/interfaces";

import { AnimNum } from "./AnimNum";

export const HealthScoreSummary = ({ summary }: HealthScoreSummaryPropsInterface) => (
    <div className="w-full grid grid-cols-3 gap-2 mt-2">
        <div className="text-center">
            <p className="text-2xl font-bold text-text-dark"><AnimNum value={summary?.total_tasks ?? 0} /></p>
            <p className="text-xs text-text-muted">{t("Total Tasks")}</p>
        </div>
        <div className="text-center">
            <p className="text-2xl font-bold text-error"><AnimNum value={summary?.active_blockers ?? 0} /></p>
            <p className="text-xs text-text-muted">{t("Active Blockers")}</p>
        </div>
        <div className="text-center">
            <p className="text-2xl font-bold text-text-dark"><AnimNum value={summary?.completed_tasks ?? 0} /></p>
            <p className="text-xs text-text-muted">{t("Completed")}</p>
        </div>
    </div>
);
