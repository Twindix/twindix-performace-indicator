import { StatsGrid } from "@/components/shared";
import { t } from "@/hooks";
import type { DecisionsStatsPropsInterface } from "@/interfaces/decisions";

export const DecisionsStats = ({ total, approved, pending, rejected, compact }: DecisionsStatsPropsInterface) => (
    <StatsGrid compact={compact} items={[
        { label: t("Total Decisions"), value: total },
        { label: t("Approved"), value: approved, valueClassName: "text-success" },
        { label: t("Pending"), value: pending, valueClassName: "text-warning" },
        { label: t("Rejected"), value: rejected, valueClassName: "text-error" },
    ]} />
);
