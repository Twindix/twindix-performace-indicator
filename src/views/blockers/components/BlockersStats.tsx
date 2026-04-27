import { Card, CardContent } from "@/atoms";
import { AnimatedNumber } from "@/components/shared";
import { t } from "@/hooks";
import type { BlockersStatsPropsInterface } from "@/interfaces";
import { cn } from "@/utils";

export const BlockersStats = ({ stats, compact }: BlockersStatsPropsInterface) => (
    <div className={cn("grid grid-cols-2 sm:grid-cols-4", compact ? "gap-2 mb-3" : "gap-3 mb-6")}>
        <Card>
            <CardContent className="p-3 sm:p-4 text-center">
                <p className="text-2xl sm:text-3xl font-bold text-text-dark"><AnimatedNumber value={stats.total} /></p>
                <p className="text-[10px] sm:text-xs text-text-muted mt-1">{t("Total Blockers")}</p>
            </CardContent>
        </Card>
        <Card>
            <CardContent className="p-3 sm:p-4 text-center">
                <p className="text-2xl sm:text-3xl font-bold text-error"><AnimatedNumber value={stats.active} /></p>
                <p className="text-[10px] sm:text-xs text-text-muted mt-1">{t("Active")}</p>
            </CardContent>
        </Card>
        <Card>
            <CardContent className="p-3 sm:p-4 text-center">
                <p className="text-2xl sm:text-3xl font-bold text-success"><AnimatedNumber value={stats.resolved} /></p>
                <p className="text-[10px] sm:text-xs text-text-muted mt-1">{t("Resolved")}</p>
            </CardContent>
        </Card>
        <Card>
            <CardContent className="p-3 sm:p-4 text-center">
                <p className="text-2xl sm:text-3xl font-bold text-text-dark"><AnimatedNumber value={stats.avgDuration} suffix="d" /></p>
                <p className="text-[10px] sm:text-xs text-text-muted mt-1">{t("Avg Duration")}</p>
            </CardContent>
        </Card>
    </div>
);
