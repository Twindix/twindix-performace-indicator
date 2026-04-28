import { Header } from "@/components/shared";
import { DashboardSkeleton } from "@/components/skeletons";
import { t, useDashboard, usePageLoader, useSettings } from "@/hooks";
import { useSprintStore } from "@/store";
import { cn } from "@/utils";

import { ActiveBlockersCard, FrictionAreasGrid, HealthScoreCard, MetricsSection } from "@/components/dashboard";

export const DashboardView = () => {
    const pageLoading = usePageLoader();
    const [settings] = useSettings();
    const compact = settings.compactView;
    const { activeSprintId } = useSprintStore();
    const { healthScore, metrics, isLoading: isFetching } = useDashboard(activeSprintId);

    if (pageLoading || isFetching) return <DashboardSkeleton />;

    const overallScore = healthScore?.overall ?? 0;
    const subScores = healthScore?.sub_scores ?? {};
    const summary = healthScore?.summary;
    const activeBlockers = healthScore?.active_blockers ?? [];

    return (
        <div>
            <Header
                title={t("Sprint Dashboard")}
                description={t("Real-time overview of sprint health, delivery friction, and team performance")}
            />

            <div className={cn("grid grid-cols-1 lg:grid-cols-3 stagger-children", compact ? "gap-3 mb-3" : "gap-6 mb-6")}>
                <HealthScoreCard overallScore={overallScore} summary={summary} />
                <FrictionAreasGrid subScores={subScores} compact={compact} />
            </div>

            {metrics && <MetricsSection metrics={metrics} compact={compact} />}

            <ActiveBlockersCard blockers={activeBlockers} />
        </div>
    );
};
