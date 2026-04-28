import type {
    BlockerInterface,
    BlockerStatsInterface,
    BlockersAnalyticsInterface,
} from "@/interfaces";

export const computeBlockerStats = (
    blockers: BlockerInterface[],
    analytics: BlockersAnalyticsInterface | null,
): BlockerStatsInterface => {
    if (analytics) {
        return {
            total: analytics.total,
            active: analytics.active,
            resolved: analytics.resolved,
            avgDuration: Math.round(analytics.avg_duration_days ?? 0),
        };
    }
    const active = blockers.filter((b) => b.status === "active" || b.status === "escalated").length;
    const resolved = blockers.filter((b) => b.status === "resolved").length;
    const durations = blockers.map((b) => Number(b.duration_days ?? 0));
    const avgDuration = durations.length
        ? Math.round(durations.reduce((s, v) => s + v, 0) / durations.length)
        : 0;
    return { total: blockers.length, active, resolved, avgDuration };
};
