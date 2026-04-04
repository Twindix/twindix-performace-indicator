import { Briefcase, Calendar, Mail, MapPin, Shield, Users } from "lucide-react";

import { Badge, Card, CardContent } from "@/atoms";
import { Header, ScoreGauge } from "@/components/shared";
import { t, useAuth, useSettings } from "@/hooks";
import { useSprintStore } from "@/store";
import { Avatar, AvatarFallback } from "@/ui";
import { cn, getStorageItem, storageKeys } from "@/utils";
import type { TaskInterface, TeamMemberWorkloadInterface, SprintMetricsInterface } from "@/interfaces";

const roleLabels: Record<string, string> = {
    ceo: "Chief Executive Officer",
    cto: "Chief Technology Officer",
    senior_frontend_engineer: "Senior Frontend Engineer",
    frontend_engineer: "Frontend Engineer",
    senior_backend_engineer: "Senior Backend Engineer",
    ai_engineer: "AI Engineer",
    quality_control: "Quality Control",
    project_manager: "Project Manager",
    hr_manager: "HR Manager",
    data_analyst: "Data Analyst",
    uiux_designer: "UI/UX Product Designer",
};

export const ProfileView = () => {
    useSettings();
    const { user } = useAuth();
    const { activeSprintId } = useSprintStore();

    const tasks = (getStorageItem<TaskInterface[]>(storageKeys.tasks) ?? []).filter((t) => t.sprintId === activeSprintId && t.assigneeId === user?.id);
    const workload = (getStorageItem<TeamMemberWorkloadInterface[]>(storageKeys.workload) ?? []).find((w) => w.sprintId === activeSprintId && w.memberId === user?.id);
    const allMetrics = getStorageItem<SprintMetricsInterface[]>(storageKeys.metrics) ?? [];
    const sprintMetrics = allMetrics.find((m) => m.sprintId === activeSprintId);

    const doneTasks = tasks.filter((t) => t.phase === "done").length;
    const inProgressTasks = tasks.filter((t) => t.phase === "in_progress").length;
    const blockedTasks = tasks.filter((t) => t.hasBlocker).length;
    const totalPoints = tasks.reduce((s, t) => s + t.storyPoints, 0);
    const donePoints = tasks.filter((t) => t.phase === "done").reduce((s, t) => s + t.storyPoints, 0);
    const utilization = workload ? Math.round((workload.assignedPoints / workload.capacity) * 100) : 0;

    if (!user) return null;

    return (
        <div>
            <Header title={t("My Profile")} description={t("Your account details and current sprint performance")} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <Card className="lg:row-span-2">
                    <CardContent className="p-6 flex flex-col items-center text-center">
                        <Avatar className="h-24 w-24 mb-4">
                            <AvatarFallback className="text-2xl font-bold">{user.avatar}</AvatarFallback>
                        </Avatar>
                        <h2 className="text-xl font-bold text-text-dark">{user.name}</h2>
                        <p className="text-sm text-primary font-medium mt-1">{roleLabels[user.role] ?? user.role}</p>
                        <Badge variant="default" className="mt-2">{user.team} Team</Badge>

                        <div className="w-full mt-6 space-y-3">
                            <div className="flex items-center gap-3 text-sm text-text-secondary">
                                <Mail className="h-4 w-4 text-text-muted" />
                                <span>{user.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-text-secondary">
                                <Briefcase className="h-4 w-4 text-text-muted" />
                                <span>{roleLabels[user.role] ?? user.role}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-text-secondary">
                                <Users className="h-4 w-4 text-text-muted" />
                                <span>{user.team} Team</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-text-secondary">
                                <MapPin className="h-4 w-4 text-text-muted" />
                                <span>Cairo, Egypt</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-text-secondary">
                                <Calendar className="h-4 w-4 text-text-muted" />
                                <span>Joined Jan 2025</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-text-secondary">
                                <Shield className="h-4 w-4 text-text-muted" />
                                <span>Active Member</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Sprint Performance */}
                <Card className="lg:col-span-2">
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-text-dark mb-4">{t("Current Sprint Performance")}</h3>
                        <div className="flex items-center gap-8">
                            <ScoreGauge score={sprintMetrics?.healthScore ?? 0} size="md" label="Sprint Health" />
                            <div className="grid grid-cols-2 gap-4 flex-1">
                                <div className="rounded-xl bg-muted p-4 text-center">
                                    <p className="text-2xl font-bold text-text-dark">{tasks.length}</p>
                                    <p className="text-xs text-text-muted mt-1">{t("Assigned Tasks")}</p>
                                </div>
                                <div className="rounded-xl bg-success-light p-4 text-center">
                                    <p className="text-2xl font-bold text-success">{doneTasks}</p>
                                    <p className="text-xs text-text-muted mt-1">{t("Completed")}</p>
                                </div>
                                <div className="rounded-xl bg-warning-light p-4 text-center">
                                    <p className="text-2xl font-bold text-warning">{inProgressTasks}</p>
                                    <p className="text-xs text-text-muted mt-1">{t("In Progress")}</p>
                                </div>
                                <div className="rounded-xl bg-error-light p-4 text-center">
                                    <p className="text-2xl font-bold text-error">{blockedTasks}</p>
                                    <p className="text-xs text-text-muted mt-1">{t("Blocked")}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Workload & Points */}
                <Card className="lg:col-span-2">
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-text-dark mb-4">{t("Workload Overview")}</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="text-center">
                                <p className="text-xs text-text-muted mb-1">{t("Story Points")}</p>
                                <p className="text-2xl font-bold text-text-dark">{donePoints}<span className="text-sm text-text-muted font-normal">/{totalPoints}</span></p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs text-text-muted mb-1">{t("Utilization")}</p>
                                <p className={cn("text-2xl font-bold", utilization > 100 ? "text-error" : utilization > 85 ? "text-warning" : "text-success")}>{utilization}%</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs text-text-muted mb-1">{t("Context Switches")}</p>
                                <p className={cn("text-2xl font-bold", (workload?.contextSwitches ?? 0) > 4 ? "text-error" : "text-text-dark")}>{workload?.contextSwitches ?? 0}<span className="text-sm text-text-muted font-normal">/day</span></p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs text-text-muted mb-1">{t("Capacity")}</p>
                                <p className="text-2xl font-bold text-text-dark">{workload?.capacity ?? 0}<span className="text-sm text-text-muted font-normal"> pts</span></p>
                            </div>
                        </div>

                        {/* Utilization bar */}
                        <div className="mt-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-text-secondary">{t("Capacity Utilization")}</span>
                                <span className={cn("text-xs font-bold", utilization > 100 ? "text-error" : "text-text-dark")}>{workload?.assignedPoints ?? 0}/{workload?.capacity ?? 0} pts ({utilization}%)</span>
                            </div>
                            <div className="h-3 rounded-full bg-muted overflow-hidden">
                                <div className={cn("h-full rounded-full transition-all", utilization > 100 ? "bg-error" : utilization > 85 ? "bg-warning" : "bg-primary")} style={{ width: `${Math.min(utilization, 100)}%` }} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* My Tasks */}
            <Card className="mt-6">
                <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-text-dark mb-4">{t("My Tasks This Sprint")}</h3>
                    {tasks.length === 0 ? (
                        <p className="text-sm text-text-muted text-center py-6">{t("No tasks assigned to you this sprint.")}</p>
                    ) : (
                        <div className="space-y-2">
                            {tasks.map((t) => (
                                <div key={t.id} className="flex items-center justify-between gap-4 rounded-xl border border-border p-3 hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className={cn("h-2.5 w-2.5 rounded-full shrink-0", t.phase === "done" ? "bg-success" : t.phase === "in_progress" ? "bg-warning" : t.phase === "review" ? "bg-[#8b5cf6]" : t.phase === "qa" ? "bg-[#ec4899]" : t.phase === "ready" ? "bg-primary" : "bg-text-muted")} />
                                        <span className="text-sm font-medium text-text-dark truncate">{t.title}</span>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        {t.hasBlocker && <Badge variant="error">Blocked</Badge>}
                                        <Badge variant={t.priority === "critical" ? "error" : t.priority === "high" ? "warning" : "secondary"} className="text-[10px]">{t.priority}</Badge>
                                        <span className="text-xs text-text-muted capitalize whitespace-nowrap">{t.phase.replace("_", " ")}</span>
                                        <span className="text-xs font-semibold text-text-muted bg-muted rounded-full h-5 w-5 flex items-center justify-center">{t.storyPoints}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
