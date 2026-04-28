import type { ResponseDistributionItemInterface, UserAnalyticsResponseDistributionInterface } from "@/interfaces/users";

export const buildResponseDistribution = (
    distribution: UserAnalyticsResponseDistributionInterface,
): ResponseDistributionItemInterface[] => [
    { label: "< 1h",   count: distribution.under_1h },
    { label: "1–4h",   count: distribution["1_to_4h"] },
    { label: "4–24h",  count: distribution["4_to_24h"] },
    { label: "> 24h",  count: distribution.over_24h },
];
