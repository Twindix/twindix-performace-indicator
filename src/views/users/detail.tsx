import { useMemo, useState } from "react";
import { ArrowLeft, Bell, CheckCircle2, Flag, ListChecks, MessageCircle, MessageSquare, Shield, TrendingUp, Zap } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@/atoms";
import { AnimatedNumber, Header } from "@/components/shared";
import { TaskPhase } from "@/enums";
import { t } from "@/hooks";
import type {
    BlockerInterface,
    CommunicationInterface,
    HandoffInterface,
    OwnershipEntryInterface,
    SprintInterface,
    TaskInterface,
    TeamMemberWorkloadInterface,
    UserInterface,
} from "@/interfaces";
import { Avatar, AvatarFallback, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui";
import { cn, formatDate, getStorageItem, storageKeys } from "@/utils";

const ROLE_LABELS: Record<string, string> = {
    ceo: "CEO", cto: "CTO",
    senior_frontend_engineer: "Sr. Frontend Engineer",
    frontend_engineer: "Frontend Engineer",
    senior_backend_engineer: "Sr. Backend Engineer",
    ai_engineer: "AI Engineer",
    quality_control: "Quality Control",
    project_manager: "Project Manager",
    hr_manager: "HR Manager",
    data_analyst: "Data Analyst",
    uiux_designer: "UI/UX Designer",
};

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

export const UserDetailView = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const [sprintFilter, setSprintFilter] = useState("all");

    const members   = getStorageItem<UserInterface[]>(storageKeys.teamMembers) ?? [];
    const allTasks  = getStorageItem<TaskInterface[]>(storageKeys.tasks) ?? [];
    const allBlockers = getStorageItem<BlockerInterface[]>(storageKeys.blockers) ?? [];
    const allComms  = getStorageItem<CommunicationInterface[]>(storageKeys.communications) ?? [];
    const allWorkloads = getStorageItem<TeamMemberWorkloadInterface[]>(storageKeys.workload) ?? [];
    const ownership = getStorageItem<OwnershipEntryInterface[]>(storageKeys.ownership) ?? [];
    const allHandoffs = getStorageItem<HandoffInterface[]>(storageKeys.handoffs) ?? [];
    const sprints   = getStorageItem<SprintInterface[]>(storageKeys.sprints) ?? [];
    const alerts    = getStorageItem<{ id: string; mentionedIds: string[]; resolvedByIds: string[]; sprintId: string }[]>(storageKeys.alerts) ?? [];
    const redFlags  = getStorageItem<{ id: string; createdById: string; sprintId: string }[]>(storageKeys.redFlags) ?? [];
    const comments  = getStorageItem<{ id: string; authorId: string; mentionedId?: string; responderId?: string; hasResponse: boolean; sprintId?: string }[]>(storageKeys.comments) ?? [];

    const user = members.find((m) => m.id === userId);

    // Sprint filter helper
    const inSprint = (sprintId: string) => sprintFilter === "all" || sprintId === sprintFilter;

    const tasks     = useMemo(() => allTasks.filter((t) => t.assigneeIds.includes(userId ?? "") && inSprint(t.sprintId)), [allTasks, userId, sprintFilter]);
    const blockers  = useMemo(() => allBlockers.filter((b) => inSprint(b.sprintId)), [allBlockers, sprintFilter]);
    const comms     = useMemo(() => allComms.filter((c) => inSprint(c.sprintId)), [allComms, sprintFilter]);
    const workloads = useMemo(() => allWorkloads.filter((w) => w.memberId === userId && inSprint(w.sprintId)), [allWorkloads, userId, sprintFilter]);
    const handoffs  = useMemo(() => allHandoffs.filter((h) => {
        const task = allTasks.find((t) => t.id === h.taskId);
        return task?.assigneeIds.includes(userId ?? "") && inSprint(h.sprintId);
    }), [allHandoffs, allTasks, userId, sprintFilter]);

    /* ── Task analytics ── */
    const doneTasks    = tasks.filter((t) => t.phase === TaskPhase.Done);
    const totalPoints  = tasks.reduce((s, t) => s + t.storyPoints, 0);
    const donePoints   = doneTasks.reduce((s, t) => s + t.storyPoints, 0);
    const deliveryRate = totalPoints > 0 ? Math.round((donePoints / totalPoints) * 100) : 0;

    const tasksByPhase = useMemo(() => {
        const phases = [TaskPhase.Backlog, TaskPhase.Ready, TaskPhase.InProgress, TaskPhase.Review, TaskPhase.QA, TaskPhase.Done];
        return phases.map((p) => ({ phase: p, count: tasks.filter((t) => t.phase === p).length }));
    }, [tasks]);

    /* ── Communication analytics ── */
    const askedBy  = comms.filter((c) => c.askedById === userId);
    const askedTo  = comms.filter((c) => c.askedToId === userId);
    const answered = askedTo.filter((c) => c.status === "answered");
    const responseRate    = askedTo.length > 0 ? Math.round((answered.length / askedTo.length) * 100) : 0;
    const avgResponseTime = answered.length > 0
        ? Math.round((answered.reduce((s, c) => s + (c.responseTimeHours ?? 0), 0) / answered.length) * 10) / 10 : 0;

    /* ── Blocker analytics ── */
    const reportedBlockers   = blockers.filter((b) => b.reporterId === userId);
    const ownedBlockers      = blockers.filter((b) => b.ownerId === userId);
    const resolvedOwned      = ownedBlockers.filter((b) => b.status === "resolved");
    const blockerResolveRate = ownedBlockers.length > 0 ? Math.round((resolvedOwned.length / ownedBlockers.length) * 100) : 0;

    /* ── Workload ── */
    const latestWorkload = workloads[workloads.length - 1];
    const capacityUsage  = latestWorkload && latestWorkload.capacity > 0
        ? Math.round((latestWorkload.assignedPoints / latestWorkload.capacity) * 100) : 0;

    /* ── Ownership (not sprint-scoped) ── */
    const ownedComponents = ownership.filter((o) => o.ownerId === userId);
    const conflictCount   = ownedComponents.filter((o) => o.hasConflict).length;

    /* ── Handoffs ── */
    const avgHandoffRate = handoffs.length > 0
        ? Math.round(handoffs.reduce((s, h) => s + h.completionRate, 0) / handoffs.length) : 0;

    /* ── Alerts ── */
    const filteredAlerts  = alerts.filter((a) => inSprint(a.sprintId));
    const alertsReceived  = filteredAlerts.filter((a) => a.mentionedIds.length === 0 || a.mentionedIds.includes(userId ?? ""));
    const alertsAcked     = alertsReceived.filter((a) => a.resolvedByIds.includes(userId ?? ""));
    const alertAckRate    = alertsReceived.length > 0 ? Math.round((alertsAcked.length / alertsReceived.length) * 100) : 0;

    /* ── Red flags ── */
    const flagsRaised = redFlags.filter((f) => f.createdById === userId && inSprint(f.sprintId));

    /* ── Comments ── */
    const filteredComments  = comments.filter((c) => !c.sprintId || inSprint(c.sprintId));
    const commentsWritten   = filteredComments.filter((c) => c.authorId === userId);
    const commentsMentioned = filteredComments.filter((c) => c.mentionedId === userId);
    const commentsAnswered  = commentsMentioned.filter((c) => c.responderId === userId || c.hasResponse);
    const commentAnswerRate = commentsMentioned.length > 0 ? Math.round((commentsAnswered.length / commentsMentioned.length) * 100) : 0;

    if (!user) {
        return (
            <div>
                <Button variant="outline" onClick={() => navigate("/users")} className="gap-2 mb-6">
                    <ArrowLeft className="h-4 w-4" />{t("Back to Users")}
                </Button>
                <p className="text-text-muted">{t("User not found")}</p>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-4">
                <Button variant="outline" size="sm" onClick={() => navigate("/users")} className="gap-2">
                    <ArrowLeft className="h-4 w-4" />{t("Back")}
                </Button>
            </div>

            <Header
                title={user.name}
                description={`${ROLE_LABELS[user.role] ?? user.role} · ${user.team}`}
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
                {/* ── Left sidebar ── */}
                <div className="lg:col-span-1 flex flex-col gap-4">
                    <Card>
                        <CardContent className="p-6 flex flex-col items-center gap-3 text-center">
                            <Avatar className="h-20 w-20">
                                <AvatarFallback className="text-2xl font-bold">{user.avatar}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold text-text-dark">{user.name}</p>
                                <p className="text-xs text-text-muted mt-0.5">{user.email}</p>
                            </div>
                            <div className="flex flex-wrap justify-center gap-1.5">
                                <Badge variant="outline">{ROLE_LABELS[user.role] ?? user.role}</Badge>
                                <Badge variant="secondary">{user.team}</Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle className="text-sm">{t("Quick Stats")}</CardTitle></CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            {[
                                { icon: ListChecks, label: t("Tasks assigned"), value: tasks.length, barValue: doneTasks.length, barMax: tasks.length, sub: `${doneTasks.length} ${t("done")}`, color: "bg-success" },
                                { icon: MessageSquare, label: t("Comm. response"), value: responseRate, barValue: responseRate, barMax: 100, sub: `${avgResponseTime}h ${t("avg")}`, color: responseRate >= 80 ? "bg-success" : responseRate >= 50 ? "bg-warning" : "bg-error" },
                                { icon: Shield, label: t("Blocker resolve"), value: blockerResolveRate, barValue: blockerResolveRate, barMax: 100, sub: `${resolvedOwned.length}/${ownedBlockers.length}`, color: blockerResolveRate >= 70 ? "bg-success" : "bg-warning" },
                                { icon: Zap, label: t("Handoff quality"), value: avgHandoffRate, barValue: avgHandoffRate, barMax: 100, sub: `${handoffs.length} ${t("handoffs")}`, color: avgHandoffRate >= 80 ? "bg-success" : avgHandoffRate >= 60 ? "bg-warning" : "bg-error" },
                            ].map(({ icon: Icon, label, value, barValue, barMax, sub, color }) => (
                                <div key={label} className="flex items-center gap-3">
                                    <Icon className="h-4 w-4 text-primary shrink-0" />
                                    <div className="flex-1">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-text-muted">{label}</span>
                                            <span className="font-semibold">{value}{label.includes("response") || label.includes("resolve") || label.includes("quality") ? "%" : ""}</span>
                                        </div>
                                        <Bar value={barValue} max={barMax} color={color} />
                                        <p className="text-[10px] text-text-muted mt-0.5">{sub}</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {ownedComponents.length > 0 && (
                        <Card>
                            <CardHeader><CardTitle className="text-sm">{t("Owned Components")}</CardTitle></CardHeader>
                            <CardContent className="flex flex-col gap-2">
                                {ownedComponents.map((o) => (
                                    <div key={o.id} className="flex items-center justify-between gap-2">
                                        <p className="text-xs text-text-secondary truncate">{o.componentName}</p>
                                        {o.hasConflict && <Badge variant="error" className="text-[10px] shrink-0">{t("Conflict")}</Badge>}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* ── Center analytics ── */}
                <div className="lg:col-span-3 flex flex-col gap-6">

                    {/* KPI row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <Card><CardContent className="p-4"><Stat label={t("Delivery Rate")} value={deliveryRate} suffix="%" color={deliveryRate >= 70 ? "text-success" : "text-warning"} /></CardContent></Card>
                        <Card><CardContent className="p-4"><Stat label={t("Points Done")} value={donePoints} suffix={`/${totalPoints}`} /></CardContent></Card>
                        <Card><CardContent className="p-4"><Stat label={t("Avg Response")} value={avgResponseTime} suffix="h" color={avgResponseTime <= 4 ? "text-success" : "text-warning"} /></CardContent></Card>
                        <Card><CardContent className="p-4"><Stat label={t("Capacity")} value={capacityUsage} suffix="%" color={capacityUsage > 110 ? "text-error" : capacityUsage > 90 ? "text-warning" : "text-success"} /></CardContent></Card>
                    </div>

                    {/* Tasks by phase */}
                    <Card>
                        <CardHeader><CardTitle className="text-base flex items-center gap-2"><ListChecks className="h-4 w-4" />{t("Tasks by Phase")}</CardTitle></CardHeader>
                        <CardContent className="flex flex-col gap-3">
                            {tasksByPhase.map(({ phase, count }) => {
                                const label = phase === "in_progress" ? "In Progress" : phase.charAt(0).toUpperCase() + phase.slice(1);
                                const maxCount = Math.max(...tasksByPhase.map((p) => p.count), 1);
                                return (
                                    <div key={phase}>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-text-secondary">{t(label)}</span>
                                            <span className="font-semibold text-text-dark">{count}</span>
                                        </div>
                                        <Bar value={count} max={maxCount} color={phase === TaskPhase.Done ? "bg-success" : phase === TaskPhase.InProgress ? "bg-warning" : "bg-primary"} />
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
                                <Stat label={t("Questions Asked")} value={askedBy.length} />
                                <Stat label={t("Questions Received")} value={askedTo.length} />
                                <Stat label={t("Answered")} value={answered.length} color="text-success" />
                                <Stat label={t("Response Rate")} value={responseRate} suffix="%" color={responseRate >= 80 ? "text-success" : "text-warning"} />
                            </div>
                            {answered.length > 0 && (
                                <div>
                                    <p className="text-xs text-text-muted mb-2">{t("Response time distribution")}</p>
                                    <div className="flex flex-col gap-2">
                                        {[
                                            { label: "< 1h",  count: answered.filter((c) => (c.responseTimeHours ?? 0) < 1).length },
                                            { label: "1–4h",  count: answered.filter((c) => { const h = c.responseTimeHours ?? 0; return h >= 1 && h < 4; }).length },
                                            { label: "4–24h", count: answered.filter((c) => { const h = c.responseTimeHours ?? 0; return h >= 4 && h < 24; }).length },
                                            { label: "> 24h", count: answered.filter((c) => (c.responseTimeHours ?? 0) >= 24).length },
                                        ].map(({ label, count }) => (
                                            <div key={label}>
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="text-text-secondary">{label}</span>
                                                    <span className="font-semibold">{count}</span>
                                                </div>
                                                <Bar value={count} max={answered.length} color={label === "< 1h" ? "bg-success" : label === "> 24h" ? "bg-error" : "bg-warning"} />
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
                                <Stat label={t("Reported")} value={reportedBlockers.length} />
                                <Stat label={t("Owned")} value={ownedBlockers.length} />
                                <Stat label={t("Resolved")} value={resolvedOwned.length} color="text-success" />
                                <Stat label={t("Resolve Rate")} value={blockerResolveRate} suffix="%" color={blockerResolveRate >= 70 ? "text-success" : "text-warning"} />
                            </div>
                            {ownedBlockers.map((b) => (
                                <div key={b.id} className="flex items-center justify-between gap-3 rounded-lg bg-muted p-2.5 mb-2">
                                    <p className="text-xs text-text-secondary truncate flex-1">{b.title}</p>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className="text-xs text-text-muted">{b.durationDays}d</span>
                                        <Badge variant={b.status === "resolved" ? "success" : b.status === "escalated" ? "error" : "warning"} className="text-[10px]">
                                            {t(b.status.charAt(0).toUpperCase() + b.status.slice(1))}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Workload */}
                    {workloads.length > 0 && (
                        <Card>
                            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Zap className="h-4 w-4" />{t("Workload")}</CardTitle></CardHeader>
                            <CardContent className="flex flex-col gap-3">
                                {workloads.map((w) => (
                                    <div key={w.sprintId} className="flex flex-col gap-1.5">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-text-secondary font-medium">{sprints.find((s) => s.id === w.sprintId)?.name ?? w.sprintId}</span>
                                            <span className="text-text-muted">{w.assignedPoints} pts · {w.completedPoints} done · {w.contextSwitches} switches</span>
                                        </div>
                                        <Bar value={w.assignedPoints} max={w.capacity} color={w.assignedPoints > w.capacity ? "bg-error" : w.assignedPoints > w.capacity * 0.9 ? "bg-warning" : "bg-success"} />
                                        <p className="text-[10px] text-text-muted">{Math.round((w.assignedPoints / w.capacity) * 100)}% {t("of capacity")}</p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* Ownership */}
                    {ownedComponents.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Shield className="h-4 w-4" />{t("Ownership")}
                                    {conflictCount > 0 && <Badge variant="error" className="ms-auto">{conflictCount} {t("conflicts")}</Badge>}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-2">
                                {ownedComponents.map((o) => (
                                    <div key={o.id} className={cn("rounded-lg p-3", o.hasConflict ? "bg-error-light" : "bg-muted")}>
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <p className="text-sm font-medium text-text-dark">{o.componentName}</p>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className="text-xs text-text-muted">{o.changeCount} {t("changes")}</span>
                                                {o.hasConflict && <Badge variant="error" className="text-[10px]">{t("Conflict")}</Badge>}
                                            </div>
                                        </div>
                                        {o.hasConflict && o.conflictDescription && <p className="text-xs text-error">{o.conflictDescription}</p>}
                                        <p className="text-xs text-text-muted mt-1">{t("Last modified")}: {formatDate(o.lastModified)}</p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* Handoffs */}
                    {handoffs.length > 0 && (
                        <Card>
                            <CardHeader><CardTitle className="text-base flex items-center gap-2"><CheckCircle2 className="h-4 w-4" />{t("Handoff Quality")}</CardTitle></CardHeader>
                            <CardContent className="flex flex-col gap-3">
                                <div className="flex items-center gap-4 mb-2">
                                    <Stat label={t("Avg Completion")} value={avgHandoffRate} suffix="%" color={avgHandoffRate >= 80 ? "text-success" : "text-warning"} />
                                    <Stat label={t("Total Handoffs")} value={handoffs.length} />
                                </div>
                                {handoffs.map((h) => (
                                    <div key={h.id}>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-text-secondary">{h.fromPhase} → {h.toPhase}</span>
                                            <span className="font-semibold">{h.completionRate}%</span>
                                        </div>
                                        <Bar value={h.completionRate} max={100} color={h.completionRate >= 80 ? "bg-success" : h.completionRate >= 60 ? "bg-warning" : "bg-error"} />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* Assigned tasks */}
                    {tasks.length > 0 && (
                        <Card>
                            <CardHeader><CardTitle className="text-base flex items-center gap-2"><ListChecks className="h-4 w-4" />{t("Assigned Tasks")}</CardTitle></CardHeader>
                            <CardContent className="flex flex-col gap-2">
                                {tasks.map((task) => {
                                    const phaseLabel = task.phase === "in_progress" ? "In Progress" : task.phase.charAt(0).toUpperCase() + task.phase.slice(1);
                                    return (
                                        <div key={task.id} className="flex items-center justify-between gap-3 rounded-lg bg-muted p-2.5">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium text-text-dark truncate">{task.title}</p>
                                                <p className="text-[10px] text-text-muted">{task.storyPoints} pts · {t("Readiness")}: {task.readinessScore}%</p>
                                            </div>
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                {task.hasBlocker && <Badge variant="error" className="text-[10px]">{t("Blocked")}</Badge>}
                                                <Badge variant="outline" className="text-[10px]">{t(phaseLabel)}</Badge>
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
                                <Stat label={t("Received")} value={alertsReceived.length} />
                                <Stat label={t("Acknowledged")} value={alertsAcked.length} color="text-success" />
                                <Stat label={t("Ack Rate")} value={alertAckRate} suffix="%" color={alertAckRate >= 80 ? "text-success" : alertAckRate >= 50 ? "text-warning" : "text-error"} />
                            </div>
                            {alertsReceived.length > 0
                                ? <><p className="text-xs text-text-muted mb-1.5">{t("Acknowledgement rate")}</p><Bar value={alertAckRate} max={100} color={alertAckRate >= 80 ? "bg-success" : alertAckRate >= 50 ? "bg-warning" : "bg-error"} /></>
                                : <p className="text-xs text-text-muted">{t("No alerts received")}</p>
                            }
                        </CardContent>
                    </Card>

                    {/* Red flags */}
                    <Card>
                        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Flag className="h-4 w-4 text-error" />{t("Red Flags")}</CardTitle></CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <Stat label={t("Raised by user")} value={flagsRaised.length} color={flagsRaised.length > 0 ? "text-error" : "text-text-dark"} />
                                <Stat label={t("Total in sprint")} value={redFlags.filter((f) => inSprint(f.sprintId)).length} />
                            </div>
                            {flagsRaised.length === 0 && <p className="text-xs text-text-muted mt-3">{t("No red flags raised by this user")}</p>}
                        </CardContent>
                    </Card>

                    {/* Comments */}
                    <Card>
                        <CardHeader><CardTitle className="text-base flex items-center gap-2"><MessageCircle className="h-4 w-4" />{t("Comments Activity")}</CardTitle></CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                                <Stat label={t("Written")} value={commentsWritten.length} />
                                <Stat label={t("Mentioned in")} value={commentsMentioned.length} />
                                <Stat label={t("Answered")} value={commentsAnswered.length} color="text-success" />
                                <Stat label={t("Answer Rate")} value={commentAnswerRate} suffix="%" color={commentAnswerRate >= 80 ? "text-success" : commentAnswerRate >= 50 ? "text-warning" : "text-error"} />
                            </div>
                            {commentsMentioned.length > 0 && (
                                <><p className="text-xs text-text-muted mb-1.5">{t("Mention response rate")}</p>
                                <Bar value={commentAnswerRate} max={100} color={commentAnswerRate >= 80 ? "bg-success" : commentAnswerRate >= 50 ? "bg-warning" : "bg-error"} /></>
                            )}
                            {commentsWritten.length === 0 && commentsMentioned.length === 0 && (
                                <p className="text-xs text-text-muted">{t("No comment activity")}</p>
                            )}
                        </CardContent>
                    </Card>

                </div>
            </div>
        </div>
    );
};
