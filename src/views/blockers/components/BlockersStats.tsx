import { StatsGrid } from "@/components/shared";
import { t } from "@/hooks";
import type { BlockersStatsPropsInterface } from "@/interfaces";

export const BlockersStats = ({ stats, compact }: BlockersStatsPropsInterface) => (
    <StatsGrid compact={compact} items={[
        { label: t("Total Blockers"), value: stats.total },
        { label: t("Active"), value: stats.active, valueClassName: "text-error" },
        { label: t("Resolved"), value: stats.resolved, valueClassName: "text-success" },
        { label: t("Avg Duration"), value: stats.avgDuration, suffix: "d" },
    ]} />
);
