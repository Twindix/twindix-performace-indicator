import { Card, CardContent } from "@/atoms";
import { StatusBadge } from "@/components/shared";
import { t } from "@/hooks";
import type { FrictionAreaCardPropsInterface } from "@/interfaces";
import { getProgressColor, getScoreStatus } from "@/lib/dashboard";
import { cn } from "@/utils";

import { AnimNum } from "./AnimNum";

export const FrictionAreaCard = ({ config, score, compact }: FrictionAreaCardPropsInterface) => {
    const Icon = config.icon;

    return (
        <Card className="overflow-hidden">
            <CardContent className={compact ? "p-3" : "p-4"}>
                <div className="flex items-center gap-2 mb-2">
                    <Icon className={cn("h-4 w-4", config.textColor)} />
                    <span className="text-xs font-medium text-text-secondary truncate">{t(config.labelKey)}</span>
                </div>
                <div className="flex items-end justify-between">
                    <AnimNum value={score} className={cn("text-2xl font-bold", config.textColor)} />
                    <StatusBadge status={getScoreStatus(score)} />
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                        className={cn("h-full rounded-full transition-all duration-500 progress-animated", getProgressColor(score))}
                        style={{ width: `${score}%` }}
                    />
                </div>
            </CardContent>
        </Card>
    );
};
