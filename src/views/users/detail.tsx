import { AlertTriangle, ArrowLeft, Bell, Flag, ListChecks, MessageCircle, MessageSquare, TrendingUp } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@/atoms";
import { AnimatedNumber, Header } from "@/components/shared";
import { t } from "@/hooks";
import { useUsersAnalytics, useUsersDetail } from "@/hooks/users";
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

const AnalyticsSkeleton = () => (
    <div className="flex flex-col gap-6 animate-pulse">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 bg-muted rounded-xl" />)}
        </div>
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-40 bg-muted rounded-xl" />)}
    </div>
);

export const UserDetailView = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();

    const { user, isLoading: userLoading, error: userError } = useUsersDetail(userId);
    const { analytics, isLoading: analyticsLoading, error: analyticsError } = useUsersAnalytics(userId);

    if (userLoading) {
        return (
            <div>
                <Button variant="outline" size="sm" onClick={() => navigate("/users")} className="gap-2 mb-6">
                    <ArrowLeft className="h-4 w-4" />{t("Back")}
                </Button>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-pulse">
                    <div className="h-64 bg-muted rounded-xl" />
                    <div className="lg:col-span-3 h-64 bg-muted rounded-xl" />
                </div>
            </div>
        );
    }

    if (userError || !user) {
        return (
            <div>
                <Button variant="outline" onClick={() => navigate("/users")} className="gap-2 mb-6">
                    <ArrowLeft className="h-4 w-4" />{t("Back to Users")}
                </Button>
                <p className="text-text-muted">{t("User not found")}</p>
            </div>
        );
    }

    const a = analytics;

    return (
        <div>
            <div className="mb-4">
                <Button variant="outline" size="sm" onClick={() => navigate("/users")} className="gap-2">
                    <ArrowLeft className="h-4 w-4" />{t("Back")}
                </Button>
            </div>

            <Header
                title={user.name ?? ""}
                description={`${ROLE_LABELS[user.role ?? ""] ?? user.role} · ${typeof user.team === "string" ? user.team : user.team?.name}`}
                actions={
                    <Select value={sprintFilter} onValueChange={setSprintFilter}>
                        <SelectTrigger className="w-[180px] h-9 text-sm">
                            <SelectValue placeholder={t("All Sprints")} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t("All Sprints")}</SelectItem>
                            {sprints.map((s) => (
                                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left sidebar */}
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
                                <Badge variant="outline">{ROLE_LABELS[user.role ?? ""] ?? user.role}</Badge>
                                <Badge variant="secondary">{typeof user.team === "string" ? user.team : user.team?.name}</Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle className="text-sm">{t("Quick Stats")}</CardTitle></CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            {analyticsLoading ? (
                                Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-10 bg-muted animate-pulse rounded-lg" />)
                            ) : a ? (
                                [
                                    { icon: ListChecks,    label: t("Tasks assigned"),  value: a.quick_stats.tasks_assigned,       barValue: a.quick_stats.tasks_done,           barMax: a.quick_stats.tasks_assigned,    sub: `${a.quick_stats.tasks_done} ${t("done")}`,                                color: "bg-success" },
                                    { icon: MessageSquare, label: t("Comm. response"),  value: a.quick_stats.comm_response_rate,   barValue: a.quick_stats.comm_response_rate,   barMax: 100,                             sub: `${a.quick_stats.comm_avg_response_hours}h ${t("avg")}`,                   color: a.quick_stats.comm_response_rate >= 80 ? "bg-success" : a.quick_stats.comm_response_rate >= 50 ? "bg-warning" : "bg-error" },
                                    { icon: TrendingUp,    label: t("Blocker resolve"), value: a.quick_stats.blocker_resolve_rate, barValue: a.quick_stats.blocker_resolve_rate, barMax: 100,                             sub: `${a.quick_stats.blockers_resolved}/${a.quick_stats.blockers_owned}`,       color: a.quick_stats.blocker_resolve_rate >= 70 ? "bg-success" : "bg-warning" },
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
                                ))
                            ) : (
                                <p className="text-xs text-text-muted text-center py-2">{t("No data")}</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Main analytics */}
                <div className="lg:col-span-3 flex flex-col gap-6">
                    {analyticsLoading ? (
                        <AnalyticsSkeleton />
                    ) : analyticsError ? (
                        <Card>
                            <CardContent className="p-8 flex flex-col items-center gap-3 text-center">
                                <AlertTriangle className="h-8 w-8 text-warning" />
                                <p className="text-sm font-medium text-text-dark">{t("Analytics Unavailable")}</p>
                                <p className="text-xs text-text-muted">{t("The analytics service is temporarily unavailable. Please try again later.")}</p>
                            </CardContent>
                        </Card>
                    ) : a ? (
                        <>
                            {/* KPI row */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                <Card><CardContent className="p-4"><Stat label={t("Delivery Rate")} value={a.top_stats.delivery_rate} suffix="%" color={a.top_stats.delivery_rate >= 70 ? "text-success" : "text-warning"} /></CardContent></Card>
                                <Card><CardContent className="p-4"><Stat label={t("Points Done")} value={a.top_stats.points_done.done} suffix={`/${a.top_stats.points_done.total}`} /></CardContent></Card>
                                <Card><CardContent className="p-4"><Stat label={t("Avg Response")} value={a.top_stats.avg_response_hours} suffix="h" color={a.top_stats.avg_response_hours <= 4 ? "text-success" : "text-warning"} /></CardContent></Card>
                            </div>

                            {/* Tasks by phase */}
                            <Card>
                                <CardHeader><CardTitle className="text-base flex items-center gap-2"><ListChecks className="h-4 w-4" />{t("Tasks by Phase")}</CardTitle></CardHeader>
                                <CardContent className="flex flex-col gap-3">
                                    {(["backlog", "ready", "in_progress", "review", "qa", "done"] as const).map((phase) => {
                                        const count = a.tasks_by_phase[phase];
                                        const label = phase === "in_progress" ? "In Progress" : phase.charAt(0).toUpperCase() + phase.slice(1);
                                        const maxCount = Math.max(...Object.values(a.tasks_by_phase), 1);
                                        return (
                                            <div key={phase}>
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="text-text-secondary">{t(label)}</span>
                                                    <span className="font-semibold text-text-dark">{count}</span>
                                                </div>
                                                <Bar value={count} max={maxCount} color={phase === "done" ? "bg-success" : phase === "in_progress" ? "bg-warning" : "bg-primary"} />
                                            </div>
                                        );
                                    })}
                                </CardContent>
                            </Card>

                            {/* Assigned tasks */}
                            {a.assigned_tasks.length > 0 && (
                                <Card>
                                    <CardHeader><CardTitle className="text-base flex items-center gap-2"><ListChecks className="h-4 w-4" />{t("Assigned Tasks")}</CardTitle></CardHeader>
                                    <CardContent className="flex flex-col gap-2">
                                        {a.assigned_tasks.map((task) => (
                                            <div key={task.id} className="flex items-center justify-between gap-3 rounded-lg bg-muted p-2.5">
                                                <p className="text-xs text-text-secondary truncate flex-1">{task.title}</p>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <span className="text-xs text-text-muted">{task.story_points}pts</span>
                                                    {task.is_blocked && <Badge variant="error" className="text-[10px]">{t("Blocked")}</Badge>}
                                                    <Badge variant={task.status === "done" ? "success" : task.status === "in_progress" ? "warning" : "secondary"} className="text-[10px]">
                                                        {t(task.status === "in_progress" ? "In Progress" : task.status.charAt(0).toUpperCase() + task.status.slice(1))}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Communication */}
                            <Card>
                                <CardHeader><CardTitle className="text-base flex items-center gap-2"><MessageSquare className="h-4 w-4" />{t("Communication Performance")}</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                                        <Stat label={t("Asked")} value={a.communication_performance.questions_asked} />
                                        <Stat label={t("Received")} value={a.communication_performance.questions_received} />
                                        <Stat label={t("Answered")} value={a.communication_performance.answered} color="text-success" />
                                        <Stat label={t("Response Rate")} value={a.communication_performance.response_rate} suffix="%" color={a.communication_performance.response_rate >= 80 ? "text-success" : "text-warning"} />
                                    </div>
                                    {a.communication_performance.answered > 0 && (
                                        <div>
                                            <p className="text-xs text-text-muted mb-2">{t("Response time distribution")}</p>
                                            <div className="flex flex-col gap-2">
                                                {([
                                                    { label: "< 1h",  key: "under_1h" },
                                                    { label: "1–4h",  key: "1_to_4h" },
                                                    { label: "4–24h", key: "4_to_24h" },
                                                    { label: "> 24h", key: "over_24h" },
                                                ] as const).map(({ label, key }) => {
                                                    const count = a.communication_performance.response_time_distribution[key];
                                                    return (
                                                        <div key={key}>
                                                            <div className="flex justify-between text-xs mb-1">
                                                                <span className="text-text-secondary">{label}</span>
                                                                <span className="font-semibold">{count}</span>
                                                            </div>
                                                            <Bar value={count} max={a.communication_performance.answered} color={key === "under_1h" ? "bg-success" : key === "over_24h" ? "bg-error" : "bg-warning"} />
                                                        </div>
                                                    );
                                                })}
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
                                        <Stat label={t("Reported")} value={a.blocker_activity.reported} />
                                        <Stat label={t("Owned")} value={a.blocker_activity.owned} />
                                        <Stat label={t("Resolved")} value={a.blocker_activity.resolved} color="text-success" />
                                        <Stat label={t("Resolve Rate")} value={a.blocker_activity.resolve_rate} suffix="%" color={a.blocker_activity.resolve_rate >= 70 ? "text-success" : "text-warning"} />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Alerts */}
                            <Card>
                                <CardHeader><CardTitle className="text-base flex items-center gap-2"><Bell className="h-4 w-4" />{t("Alerts Engagement")}</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-3 gap-4 mb-4">
                                        <Stat label={t("Received")} value={a.alerts_engagement.received} />
                                        <Stat label={t("Acknowledged")} value={a.alerts_engagement.acknowledged} color="text-success" />
                                        <Stat label={t("Ack Rate")} value={a.alerts_engagement.ack_rate} suffix="%" color={a.alerts_engagement.ack_rate >= 80 ? "text-success" : a.alerts_engagement.ack_rate >= 50 ? "text-warning" : "text-error"} />
                                    </div>
                                    {a.alerts_engagement.received > 0
                                        ? <><p className="text-xs text-text-muted mb-1.5">{t("Acknowledgement rate")}</p><Bar value={a.alerts_engagement.ack_rate} max={100} color={a.alerts_engagement.ack_rate >= 80 ? "bg-success" : a.alerts_engagement.ack_rate >= 50 ? "bg-warning" : "bg-error"} /></>
                                        : <p className="text-xs text-text-muted">{t("No alerts received")}</p>
                                    }
                                </CardContent>
                            </Card>

                            {/* Red flags */}
                            <Card>
                                <CardHeader><CardTitle className="text-base flex items-center gap-2"><Flag className="h-4 w-4 text-error" />{t("Red Flags")}</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Stat label={t("Raised by user")} value={a.red_flags.raised_by_user} color={a.red_flags.raised_by_user > 0 ? "text-error" : "text-text-dark"} />
                                        <Stat label={t("Total in sprint")} value={a.red_flags.total_in_sprint} />
                                    </div>
                                    {a.red_flags.raised_by_user === 0 && <p className="text-xs text-text-muted mt-3">{t("No red flags raised by this user")}</p>}
                                </CardContent>
                            </Card>

                            {/* Comments */}
                            <Card>
                                <CardHeader><CardTitle className="text-base flex items-center gap-2"><MessageCircle className="h-4 w-4" />{t("Comments Activity")}</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                                        <Stat label={t("Written")} value={a.comments_activity.written} />
                                        <Stat label={t("Mentioned in")} value={a.comments_activity.mentioned_in} />
                                        <Stat label={t("Answered")} value={a.comments_activity.answered} color="text-success" />
                                        <Stat label={t("Answer Rate")} value={a.comments_activity.answer_rate} suffix="%" color={a.comments_activity.answer_rate >= 80 ? "text-success" : a.comments_activity.answer_rate >= 50 ? "text-warning" : "text-error"} />
                                    </div>
                                    {a.comments_activity.mentioned_in > 0 && (
                                        <><p className="text-xs text-text-muted mb-1.5">{t("Mention response rate")}</p>
                                        <Bar value={a.comments_activity.answer_rate} max={100} color={a.comments_activity.answer_rate >= 80 ? "bg-success" : a.comments_activity.answer_rate >= 50 ? "bg-warning" : "bg-error"} /></>
                                    )}
                                    {a.comments_activity.written === 0 && a.comments_activity.mentioned_in === 0 && (
                                        <p className="text-xs text-text-muted">{t("No comment activity")}</p>
                                    )}
                                </CardContent>
                            </Card>
                        </>
                    ) : null}
                </div>
            </div>
        </div>
    );
};
