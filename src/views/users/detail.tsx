import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { Button } from "@/atoms";
import { Header, QueryBoundary } from "@/components/shared";
import { UserDetailSkeleton } from "@/components/skeletons";
import { t, useUsersAnalytics } from "@/hooks";

import {
    AlertsEngagementCard,
    AssignedTasksCard,
    BlockerActivityCard,
    CommentsActivityCard,
    CommunicationCard,
    KpiRow,
    ProfileCard,
    QuickStatsCard,
    RedFlagsCard,
    TasksByPhaseCard,
} from "@/components/users";

export const UserDetailView = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const { analytics, isLoading } = useUsersAnalytics(userId);

    return (
        <div>
            <div className="mb-4">
                <Button variant="outline" size="sm" onClick={() => navigate("/users")} className="gap-2">
                    <ArrowLeft className="h-4 w-4" />{t("Back")}
                </Button>
            </div>

            <QueryBoundary
                isLoading={isLoading}
                skeleton={<UserDetailSkeleton />}
                empty={!analytics}
                emptyState={<p className="text-text-muted">{t("User not found")}</p>}
            >
                {analytics && (
                    <>
                        <Header title={analytics.user.full_name} description={`${analytics.user.role_label} · ${analytics.user.team}`} />

                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                            <div className="lg:col-span-1 flex flex-col gap-4">
                                <ProfileCard user={analytics.user} />
                                <QuickStatsCard quickStats={analytics.quick_stats} />
                            </div>

                            <div className="lg:col-span-3 flex flex-col gap-6">
                                <KpiRow topStats={analytics.top_stats} />
                                <TasksByPhaseCard tasksByPhase={analytics.tasks_by_phase} />
                                <CommunicationCard communication={analytics.communication_performance} />
                                <BlockerActivityCard blockerActivity={analytics.blocker_activity} />
                                <AssignedTasksCard tasks={analytics.assigned_tasks} />
                                <AlertsEngagementCard alertsEngagement={analytics.alerts_engagement} />
                                <RedFlagsCard redFlags={analytics.red_flags} />
                                <CommentsActivityCard commentsActivity={analytics.comments_activity} />
                            </div>
                        </div>
                    </>
                )}
            </QueryBoundary>
        </div>
    );
};
