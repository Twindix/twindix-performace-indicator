import { AtSign, CheckCircle2, Clock, MessageCircle } from "lucide-react";

import { StatCard } from "@/atoms";
import { t } from "@/hooks";
import type { CommentsStatsGridPropsInterface } from "@/interfaces";
import { cn } from "@/utils";

export const CommentsStatsGrid = ({ stats, compact }: CommentsStatsGridPropsInterface) => (
    <div className={cn("grid grid-cols-2 lg:grid-cols-4", compact ? "gap-2 mb-3" : "gap-4 mb-6")}>
        <StatCard
            icon={MessageCircle}
            value={stats.total}
            label={t("Total Comments")}
            iconWrapperClassName="bg-primary-lighter"
            iconClassName="text-primary"
            valueClassName="text-text-dark"
        />
        <StatCard
            icon={AtSign}
            value={stats.withMention}
            label={t("With Mention")}
            iconWrapperClassName="bg-primary-lighter"
            iconClassName="text-primary"
            valueClassName="text-text-dark"
        />
        <StatCard
            icon={CheckCircle2}
            value={stats.withResponse}
            label={t("Responded")}
            iconWrapperClassName="bg-success-light"
            iconClassName="text-success"
            valueClassName="text-success"
        />
        <StatCard
            icon={Clock}
            value={stats.noResponse}
            label={t("No Response")}
            iconWrapperClassName="bg-warning-light"
            iconClassName="text-warning"
            valueClassName="text-warning"
        />
    </div>
);
