import { TrendingUp } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/atoms";
import { ScoreGauge, StatusBadge } from "@/components/shared";
import { t } from "@/hooks";
import type { HealthScoreCardPropsInterface } from "@/interfaces";
import { getScoreStatus } from "@/lib/dashboard";

import { HealthScoreSummary } from "./health-score-summary";

export const HealthScoreCard = ({ overallScore, summary }: HealthScoreCardPropsInterface) => (
    <Card className="lg:row-span-2">
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                {t("Sprint Performance Score")}
            </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
            <ScoreGauge score={overallScore} size="lg" label={t("Health")} />
            <StatusBadge status={getScoreStatus(overallScore)} />
            <HealthScoreSummary summary={summary} />
        </CardContent>
    </Card>
);
