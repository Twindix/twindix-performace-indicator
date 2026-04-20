import { useState } from "react";
import { AlertTriangle, ArrowLeft, Bell, Flag, ListChecks, MessageCircle, MessageSquare, TrendingUp } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@/atoms";
import { AnimatedNumber, Header } from "@/components/shared";
import { t } from "@/hooks";
import { useUsersAnalytics, useUsersDetail } from "@/hooks/users";
import { Avatar, AvatarFallback, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui";
import { cn } from "@/utils";
import { getStorageItem, storageKeys } from "@/utils";
import type { SprintInterface } from "@/interfaces";

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
    const [sprintFilter, setSprintFilter] = useState<string | undefined>(undefined);

    const { user, isLoading: userLoading, error: userError } = useUsersDetail(userId);
    const { analytics, isLoading: analyticsLoading, error: analyticsError } = useUsersAnalytics(userId, sprintFilter);

    const sprints = getStorageItem<SprintInterface[]>(storageKeys.sprints) ?? [];

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
                title={user.full_name}
                description={`${user.role_label ?? user.role_tier} · ${user.team.name}`}
                actions={
                    <Select value={sprintFilter ?? "all"} onValueChange={(v) => setSprintFilter(v === "all" ? undefined : v)}>
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
                                {user.role_label && <Badge variant="outline">{user.role_label}</Badge>}
                                <Badge variant="secondary">{user.team.name}</Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Stats sidebar card */}
                    <Card>
                        <CardHeader><CardTitle className="text-sm">{t("Quick Stats")}</CardTitle></CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            {analyticsLoading ? (
                                Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-10 bg-muted animate-pulse rounded-lg" />)
                            ) : a ? (
                                [
                                    { icon: ListChecks,    label: t("Tasks assigned"),  value: a.tasks.total,             barValue: a.tasks.done,                   barMax: a.tasks.total,    sub: `${a.tasks.done} ${t("done")}`,                        color: "bg-success" },
                                    { icon: MessageSquare, label: t("Comm. response"),  value: a.communication.response_rate, barValue: a.communication.response_rate, barMax: 100,           sub: `${a.communication.avg_response_time_hours}h ${t("avg")}`, color: a.communication.response_rate >= 80 ? "bg-success" : a.communication.response_rate >= 50 ? "bg-warning" : "bg-error" },
                                    { icon: TrendingUp,    label: t("Blocker resolve"), value: a.blockers.resolve_rate,   barValue: a.blockers.resolve_rate,          barMax: 100,              sub: `${a.blockers.resolved}/${a.blockers.owned}`,           color: a.blockers.resolve_rate >= 70 ? "bg-success" : "bg-warning" },
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

                {/* Center analytics */}
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
                                <Card><CardContent className="p-4"><Stat label={t("Delivery Rate")} value={a.tasks.delivery_rate} suffix="%" color={a.tasks.delivery_rate >= 70 ? "text-success" : "text-warning"} /></CardContent></Card>
                                <Card><CardContent className="p-4"><Stat label={t("Points Done")} value={a.tasks.done_points} suffix={`/${a.tasks.total_points}`} /></CardContent></Card>
                                <Card><CardContent className="p-4"><Stat label={t("Avg Response")} value={a.communication.avg_response_time_hours} suffix="h" color={a.communication.avg_response_time_hours <= 4 ? "text-success" : "text-warning"} /></CardContent></Card>
                            </div>

                            {/* Tasks by phase */}
                            <Card>
                                <CardHeader><CardTitle className="text-base flex items-center gap-2"><ListChecks className="h-4 w-4" />{t("Tasks by Phase")}</CardTitle></CardHeader>
                                <CardContent className="flex flex-col gap-3">
                                    {a.tasks.by_phase.map(({ phase, count }) => {
                                        const label = phase === "in_progress" ? "In Progress" : phase.charAt(0).toUpperCase() + phase.slice(1);
                                        const maxCount = Math.max(...a.tasks.by_phase.map((p) => p.count), 1);
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

                            {/* Communication */}
                            <Card>
                                <CardHeader><CardTitle className="text-base flex items-center gap-2"><MessageSquare className="h-4 w-4" />{t("Communication Performance")}</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                                        <Stat label={t("Questions Asked")} value={a.communication.asked} />
                                        <Stat label={t("Questions Received")} value={a.communication.received} />
                                        <Stat label={t("Answered")} value={a.communication.answered} color="text-success" />
                                        <Stat label={t("Response Rate")} value={a.communication.response_rate} suffix="%" color={a.communication.response_rate >= 80 ? "text-success" : "text-warning"} />
                                    </div>
                                    {a.communication.answered > 0 && (
                                        <div>
                                            <p className="text-xs text-text-muted mb-2">{t("Response time distribution")}</p>
                                            <div className="flex flex-col gap-2">
                                                {[
                                                    { label: "< 1h",  count: a.communication.response_time_distribution.under_1h },
                                                    { label: "1–4h",  count: a.communication.response_time_distribution.one_to_4h },
                                                    { label: "4–24h", count: a.communication.response_time_distribution.four_to_24h },
                                                    { label: "> 24h", count: a.communication.response_time_distribution.over_24h },
                                                ].map(({ label, count }) => (
                                                    <div key={label}>
                                                        <div className="flex justify-between text-xs mb-1">
                                                            <span className="text-text-secondary">{label}</span>
                                                            <span className="font-semibold">{count}</span>
                                                        </div>
                                                        <Bar value={count} max={a.communication.answered} color={label === "< 1h" ? "bg-success" : label === "> 24h" ? "bg-error" : "bg-warning"} />
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
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                                        <Stat label={t("Reported")} value={a.blockers.reported} />
                                        <Stat label={t("Owned")} value={a.blockers.owned} />
                                        <Stat label={t("Resolved")} value={a.blockers.resolved} color="text-success" />
                                        <Stat label={t("Resolve Rate")} value={a.blockers.resolve_rate} suffix="%" color={a.blockers.resolve_rate >= 70 ? "text-success" : "text-warning"} />
                                    </div>
                                    {a.blockers.list.map((b) => (
                                        <div key={b.id} className="flex items-center justify-between gap-3 rounded-lg bg-muted p-2.5 mb-2">
                                            <p className="text-xs text-text-secondary truncate flex-1">{b.title}</p>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className="text-xs text-text-muted">{b.duration_days}d</span>
                                                <Badge variant={b.status === "resolved" ? "success" : b.status === "escalated" ? "error" : "warning"} className="text-[10px]">
                                                    {t(b.status.charAt(0).toUpperCase() + b.status.slice(1))}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            {/* Alerts */}
                            <Card>
                                <CardHeader><CardTitle className="text-base flex items-center gap-2"><Bell className="h-4 w-4" />{t("Alerts Engagement")}</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-3 gap-4 mb-4">
                                        <Stat label={t("Received")} value={a.alerts.received} />
                                        <Stat label={t("Acknowledged")} value={a.alerts.acknowledged} color="text-success" />
                                        <Stat label={t("Ack Rate")} value={a.alerts.ack_rate} suffix="%" color={a.alerts.ack_rate >= 80 ? "text-success" : a.alerts.ack_rate >= 50 ? "text-warning" : "text-error"} />
                                    </div>
                                    {a.alerts.received > 0
                                        ? <><p className="text-xs text-text-muted mb-1.5">{t("Acknowledgement rate")}</p><Bar value={a.alerts.ack_rate} max={100} color={a.alerts.ack_rate >= 80 ? "bg-success" : a.alerts.ack_rate >= 50 ? "bg-warning" : "bg-error"} /></>
                                        : <p className="text-xs text-text-muted">{t("No alerts received")}</p>
                                    }
                                </CardContent>
                            </Card>

                            {/* Red flags */}
                            <Card>
                                <CardHeader><CardTitle className="text-base flex items-center gap-2"><Flag className="h-4 w-4 text-error" />{t("Red Flags")}</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Stat label={t("Raised by user")} value={a.red_flags.raised} color={a.red_flags.raised > 0 ? "text-error" : "text-text-dark"} />
                                        <Stat label={t("Total in sprint")} value={a.red_flags.total_in_sprint} />
                                    </div>
                                    {a.red_flags.raised === 0 && <p className="text-xs text-text-muted mt-3">{t("No red flags raised by this user")}</p>}
                                </CardContent>
                            </Card>

                            {/* Comments */}
                            <Card>
                                <CardHeader><CardTitle className="text-base flex items-center gap-2"><MessageCircle className="h-4 w-4" />{t("Comments Activity")}</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                                        <Stat label={t("Written")} value={a.comments.written} />
                                        <Stat label={t("Mentioned in")} value={a.comments.mentioned} />
                                        <Stat label={t("Answered")} value={a.comments.answered} color="text-success" />
                                        <Stat label={t("Answer Rate")} value={a.comments.answer_rate} suffix="%" color={a.comments.answer_rate >= 80 ? "text-success" : a.comments.answer_rate >= 50 ? "text-warning" : "text-error"} />
                                    </div>
                                    {a.comments.mentioned > 0 && (
                                        <><p className="text-xs text-text-muted mb-1.5">{t("Mention response rate")}</p>
                                        <Bar value={a.comments.answer_rate} max={100} color={a.comments.answer_rate >= 80 ? "bg-success" : a.comments.answer_rate >= 50 ? "bg-warning" : "bg-error"} /></>
                                    )}
                                    {a.comments.written === 0 && a.comments.mentioned === 0 && (
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
