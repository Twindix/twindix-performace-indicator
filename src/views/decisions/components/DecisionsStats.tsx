import { Card, CardContent } from "@/atoms";
import { AnimatedNumber } from "@/components/shared";
import { t } from "@/hooks";
import type { DecisionsStatsPropsInterface } from "@/interfaces/decisions";
import { cn } from "@/utils";

export const DecisionsStats = ({ total, approved, pending, rejected, compact }: DecisionsStatsPropsInterface) => (
    <div className={cn("grid grid-cols-2 sm:grid-cols-4", compact ? "gap-2 mb-3" : "gap-4 mb-6")}>
        <Card>
            <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-text-dark"><AnimatedNumber value={total} /></p>
                <p className="text-xs text-text-muted">{t("Total Decisions")}</p>
            </CardContent>
        </Card>
        <Card>
            <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-success"><AnimatedNumber value={approved} /></p>
                <p className="text-xs text-text-muted">{t("Approved")}</p>
            </CardContent>
        </Card>
        <Card>
            <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-warning"><AnimatedNumber value={pending} /></p>
                <p className="text-xs text-text-muted">{t("Pending")}</p>
            </CardContent>
        </Card>
        <Card>
            <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-error"><AnimatedNumber value={rejected} /></p>
                <p className="text-xs text-text-muted">{t("Rejected")}</p>
            </CardContent>
        </Card>
    </div>
);
