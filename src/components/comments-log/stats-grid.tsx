import { AtSign, CheckCircle2, Clock, MessageCircle } from "lucide-react";

import { StatsGrid } from "@/components/shared";
import { t } from "@/hooks";
import type { CommentsStatsGridPropsInterface } from "@/interfaces";

export const CommentsStatsGrid = ({ stats, compact }: CommentsStatsGridPropsInterface) => (
    <StatsGrid compact={compact} items={[
        { label: t("Total Comments"), value: stats.total, icon: MessageCircle, iconWrapperClassName: "bg-primary-lighter", iconClassName: "text-primary", valueClassName: "text-text-dark" },
        { label: t("With Mention"), value: stats.withMention, icon: AtSign, iconWrapperClassName: "bg-primary-lighter", iconClassName: "text-primary", valueClassName: "text-text-dark" },
        { label: t("Responded"), value: stats.withResponse, icon: CheckCircle2, iconWrapperClassName: "bg-success-light", iconClassName: "text-success", valueClassName: "text-success" },
        { label: t("No Response"), value: stats.noResponse, icon: Clock, iconWrapperClassName: "bg-warning-light", iconClassName: "text-warning", valueClassName: "text-warning" },
    ]} />
);
