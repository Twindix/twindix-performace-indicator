import { ArrowLeft, Bell, Flag, ListChecks, MessageCircle, MessageSquare, TrendingUp } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Skeleton } from "@/atoms";
import { AnimatedNumber, Header } from "@/components/shared";
import { t, useUsersAnalytics } from "@/hooks";
import { Avatar, AvatarFallback } from "@/ui";
import { cn } from "@/utils";

const Bar = ({ value, max, color = "bg-primary" }: { value: number; max: number; color?: string }) => (
    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div className={cn("h-full rounded-full transition-all duration-500", color)} style={{ width: `${Math.min(100, max > 0 ? (value / max) * 100 : 0)}%` }} />
    </div>
);

const Stat = ({ label, value, suffix = "", color = "text-text-dark" }: { label: string; value: number; suffix?: string; color?: string }) => (
    <div className="flex flex-col gap-0.5">
        <p className={cn("text-2xl font-bold", color)}><AnimatedNumber value={value} suffix={suffix} /></p>
        <p className="text-xs text-text-muted">{label}</p>
    </div>
);

const PHASE_LABELS: Record<string, string> = {
    backlog: "Backlog",
    ready: "Ready",
    in_progress: "In Progress",
    review: "Review",
    qa: "QA",
    done: "Done",
};

export const UserDetailView = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const { analytics, isLoading } = useUsersAnalytics(userId);

    if (isLoading) {
        return (
            <div>
                <Button variant="outline" size="sm" onClick={() => navigate("/users")} className="gap-2 mb-6">
                    <ArrowLeft className="h-4 w-4" />{t("Back")}
                </Button>
                <div className="flex flex-col gap-4">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
                </div>
            </div>
        );
    }

    if (!analytics) {
        return (
            <div>
                <Button variant="outline" onClick={() => navigate("/users")} className="gap-2 mb-6">
                    <ArrowLeft className="h-4 w-4" />{t("Back to Users")}
                </Button>
                <p className="text-text-muted">{t("User not found")}</p>
            </div>
        );
    }

    const { user, top_stats, quick_stats, tasks_by_phase, communication_performance, blocker_activity, assigned_tasks, alerts_engagement, red_flags, comments_activity } = analytics;

    const phaseRows = (Object.keys(tasks_by_phase) as (keyof typeof tasks_by_phase)[]).map((phase) => ({
        phase,
        count: tasks_by_phase[phase],
        label: PHASE_LABELS[phase] ?? phase,
    }));
    const maxPhaseCount = Math.max(...phaseRows.map((p) => p.count), 1);

    const responseDistribution = [
        { label: "< 1h", count: communication_performance.response_time_distribution.under_1h },
        { label: "1–4h", count: communication_performance.response_time_distribution["1_to_4h"] },
        { label: "4–24h", count: communication_performance.response_time_distribution["4_to_24h"] },
        { label: "> 24h", count: communication_performance.response_time_distribution.over_24h },
    ];

    return (
        <div>
            <div className="mb-4">
                <Button variant="outline" size="sm" onClick={() => navigate("/users")} className="gap-2">
                    <ArrowLeft className="h-4 w-4" />{t("Back")}
                </Button>
            </div>

            <Header
                title={user.full_name}
                description={`${user.role_label} · ${user.team}`}
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* ── Left sidebar ── */}
                <div className="lg:col-span-1 flex flex-col gap-4">
                    <Card>
                        <CardContent className="p-6 flex flex-col items-center gap-3 text-center">
                            <Avatar className="h-20 w-20">
                                <AvatarFallback className="text-2xl font-bold">{user.avatar_initials}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold text-text-dark">{user.full_name}</p>
                                <p className="text-xs text-text-muted mt-0.5">{user.email}</p>
                            </div>
                            <div className="flex flex-wrap justify-center gap-1.5">
                                <Badge variant="outline">{user.role_label}</Badge>
                                <Badge variant="secondary">{user.team || t("No Team")}</Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle className="text-sm">{t("Quick Stats")}</CardTitle></CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            {[
                                { icon: ListChecks,    label: t("Tasks assigned"),  value: quick_stats.tasks_assigned,       barValue: quick_stats.tasks_done,           barMax: quick_stats.tasks_assigned, sub: `${quick_stats.tasks_done} ${t("done")}`,                            color: "bg-success" },
                                { icon: MessageSquare, label: t("Comm. response"),  value: quick_stats.comm_response_rate,   barValue: quick_stats.comm_response_rate,   barMax: 100,                        sub: `${quick_stats.comm_avg_response_hours}h ${t("avg")}`,               color: quick_stats.comm_response_rate >= 80 ? "bg-success" : quick_stats.comm_response_rate >= 50 ? "bg-warning" : "bg-error" },
                                { icon: TrendingUp,    label: t("Blocker resolve"), value: quick_stats.blocker_resolve_rate, barValue: quick_stats.blocker_resolve_rate, barMax: 100,                        sub: `${quick_stats.blockers_resolved}/${quick_stats.blockers_owned}`,     color: quick_stats.blocker_resolve_rate >= 70 ? "bg-success" : "bg-warning" },
                            ].map(({ icon: Icon, label, value, barValue, barMax, sub, color }) => (
                                <div key={label} className="flex items-center gap-3">
                                    <Icon className="h-4 w-4 text-primary shrink-0" />
                                    <div className="flex-1">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-text-muted">{label}</span>
                                            <span className="font-semibold">{value}{label.includes("response") || label.includes("resolve") ? "%" : ""}</span>
                                        </div>
                                        <Bar value={barValue} max={barMax} color={color} />
                                        <p className="text-[10px] text-text-muted mt-0.5">{sub}</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* ── Center analytics ── */}
                <div className="lg:col-span-3 flex flex-col gap-6">

                    {/* KPI row */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <Card><CardContent className="p-4"><Stat label={t("Delivery Rate")} value={top_stats.delivery_rate} suffix="%" color={top_stats.delivery_rate >= 70 ? "text-success" : "text-warning"} /></CardContent></Card>
                        <Card><CardContent className="p-4"><Stat label={t("Points Done")} value={top_stats.points_done.done} suffix={`/${top_stats.points_done.total}`} /></CardContent></Card>
                        <Card><CardContent className="p-4"><Stat label={t("Avg Response")} value={top_stats.avg_response_hours} suffix="h" color={top_stats.avg_response_hours <= 4 ? "text-success" : "text-warning"} /></CardContent></Card>
                    </div>

                    {/* Tasks by phase */}
                    <Card>
                        <CardHeader><CardTitle className="text-base flex items-center gap-2"><ListChecks className="h-4 w-4" />{t("Tasks by Phase")}</CardTitle></CardHeader>
                        <CardContent className="flex flex-col gap-3">
                            {phaseRows.map(({ phase, count, label }) => (
                                <div key={phase}>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-text-secondary">{t(label)}</span>
                                        <span className="font-semibold text-text-dark">{count}</span>
                                    </div>
                                    <Bar value={count} max={maxPhaseCount} color={phase === "done" ? "bg-success" : phase === "in_progress" ? "bg-warning" : "bg-primary"} />
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Communication */}
                    <Card>
                        <CardHeader><CardTitle className="text-base flex items-center gap-2"><MessageSquare className="h-4 w-4" />{t("Communication Performance")}</CardTitle></CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                                <Stat label={t("Questions Asked")} value={communication_performance.questions_asked} />
                                <Stat label={t("Questions Received")} value={communication_performance.questions_received} />
                                <Stat label={t("Answered")} value={communication_performance.answered} color="text-success" />
                                <Stat label={t("Response Rate")} value={communication_performance.response_rate} suffix="%" color={communication_performance.response_rate >= 80 ? "text-success" : "text-warning"} />
                            </div>
                            {communication_performance.answered > 0 && (
                                <div>
                                    <p className="text-xs text-text-muted mb-2">{t("Response time distribution")}</p>
                                    <div className="flex flex-col gap-2">
                                        {responseDistribution.map(({ label, count }) => (
                                            <div key={label}>
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="text-text-secondary">{label}</span>
                                                    <span className="font-semibold">{count}</span>
                                                </div>
                                                <Bar value={count} max={communication_performance.answered} color={label === "< 1h" ? "bg-success" : label === "> 24h" ? "bg-error" : "bg-warning"} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Blockers */}
                    <Card>
                        <CardHeader><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4" />{t("Blocker Activity")}</CardTitle></CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <Stat label={t("Reported")} value={blocker_activity.reported} />
                                <Stat label={t("Owned")} value={blocker_activity.owned} />
                                <Stat label={t("Resolved")} value={blocker_activity.resolved} color="text-success" />
                                <Stat label={t("Resolve Rate")} value={blocker_activity.resolve_rate} suffix="%" color={blocker_activity.resolve_rate >= 70 ? "text-success" : "text-warning"} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Assigned tasks */}
                    {assigned_tasks.length > 0 && (
                        <Card>
                            <CardHeader><CardTitle className="text-base flex items-center gap-2"><ListChecks className="h-4 w-4" />{t("Assigned Tasks")}</CardTitle></CardHeader>
                            <CardContent className="flex flex-col gap-2">
                                {assigned_tasks.map((task) => {
                                    const label = PHASE_LABELS[task.status] ?? task.status;
                                    return (
                                        <div key={task.id} className="flex items-center justify-between gap-3 rounded-lg bg-muted p-2.5">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium text-text-dark truncate">{task.title}</p>
                                                <p className="text-[10px] text-text-muted">{task.story_points} pts · {t("Readiness")}: {task.readiness_percent}%</p>
                                            </div>
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                {task.is_blocked && <Badge variant="error" className="text-[10px]">{t("Blocked")}</Badge>}
                                                <Badge variant="outline" className="text-[10px]">{t(label)}</Badge>
                                            </div>
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>
                    )}

                    {/* Alerts */}
                    <Card>
                        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Bell className="h-4 w-4" />{t("Alerts Engagement")}</CardTitle></CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <Stat label={t("Received")} value={alerts_engagement.received} />
                                <Stat label={t("Acknowledged")} value={alerts_engagement.acknowledged} color="text-success" />
                                <Stat label={t("Ack Rate")} value={alerts_engagement.ack_rate} suffix="%" color={alerts_engagement.ack_rate >= 80 ? "text-success" : alerts_engagement.ack_rate >= 50 ? "text-warning" : "text-error"} />
                            </div>
                            {alerts_engagement.received > 0
                                ? <><p className="text-xs text-text-muted mb-1.5">{t("Acknowledgement rate")}</p><Bar value={alerts_engagement.ack_rate} max={100} color={alerts_engagement.ack_rate >= 80 ? "bg-success" : alerts_engagement.ack_rate >= 50 ? "bg-warning" : "bg-error"} /></>
                                : <p className="text-xs text-text-muted">{t("No alerts received")}</p>
                            }
                        </CardContent>
                    </Card>

                    {/* Red flags */}
                    <Card>
                        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Flag className="h-4 w-4 text-error" />{t("Red Flags")}</CardTitle></CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <Stat label={t("Raised by user")} value={red_flags.raised_by_user} color={red_flags.raised_by_user > 0 ? "text-error" : "text-text-dark"} />
                                <Stat label={t("Total in sprint")} value={red_flags.total_in_sprint} />
                            </div>
                            {red_flags.raised_by_user === 0 && <p className="text-xs text-text-muted mt-3">{t("No red flags raised by this user")}</p>}
                        </CardContent>
                    </Card>

                    {/* Comments */}
                    <Card>
                        <CardHeader><CardTitle className="text-base flex items-center gap-2"><MessageCircle className="h-4 w-4" />{t("Comments Activity")}</CardTitle></CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                                <Stat label={t("Written")} value={comments_activity.written} />
                                <Stat label={t("Mentioned in")} value={comments_activity.mentioned_in} />
                                <Stat label={t("Answered")} value={comments_activity.answered} color="text-success" />
                                <Stat label={t("Answer Rate")} value={comments_activity.answer_rate} suffix="%" color={comments_activity.answer_rate >= 80 ? "text-success" : comments_activity.answer_rate >= 50 ? "text-warning" : "text-error"} />
                            </div>
                            {comments_activity.mentioned_in > 0 && (
                                <><p className="text-xs text-text-muted mb-1.5">{t("Mention response rate")}</p>
                                <Bar value={comments_activity.answer_rate} max={100} color={comments_activity.answer_rate >= 80 ? "bg-success" : comments_activity.answer_rate >= 50 ? "bg-warning" : "bg-error"} /></>
                            )}
                            {comments_activity.written === 0 && comments_activity.mentioned_in === 0 && (
                                <p className="text-xs text-text-muted">{t("No comment activity")}</p>
                            )}
                        </CardContent>
                    </Card>

                </div>
            </div>
        </div>
    );
};
