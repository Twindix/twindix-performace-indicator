import { Briefcase, Calendar, Mail, MapPin, Shield, Users } from "lucide-react";

import { Badge, Card, CardContent } from "@/atoms";
import { Header, ScoreGauge } from "@/components/shared";
import { ProfileSkeleton } from "@/components/skeletons";
import { t, useAuth, useSettings, usePageLoader } from "@/hooks";
import { useSprintStore } from "@/store";
import { Avatar, AvatarFallback } from "@/ui";
import { cn, getStorageItem, storageKeys } from "@/utils";
import type { TaskInterface, SprintMetricsInterface } from "@/interfaces";

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
    const isLoading = usePageLoader();
    useSettings();
    const { user } = useAuth();
    const { activeSprintId } = useSprintStore();

    const tasks = (getStorageItem<TaskInterface[]>(storageKeys.tasks) ?? []).filter((t) => t.sprintId === activeSprintId && (t.assigneeIds ?? []).includes(user?.id ?? ""));
    const allMetrics = getStorageItem<SprintMetricsInterface[]>(storageKeys.metrics) ?? [];
    const sprintMetrics = allMetrics.find((m) => m.sprintId === activeSprintId);

    const doneTasks = tasks.filter((t) => t.phase === "done").length;
    const inProgressTasks = tasks.filter((t) => t.phase === "in_progress").length;
    const blockedTasks = tasks.filter((t) => t.hasBlocker).length;

    if (!user) return null;
    if (isLoading) return <ProfileSkeleton />;

    return (
        <div>
            <Header title={t("My Profile")} description={t("Your account details and current sprint performance")} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <Card className="lg:row-span-2">
                    <CardContent className="p-6 flex flex-col items-center text-center">
                        <Avatar className="h-20 w-20 sm:h-24 sm:w-24 mb-4">
                            <AvatarFallback className="text-2xl font-bold">{user.avatar}</AvatarFallback>
                        </Avatar>
                        <h2 className="text-xl font-bold text-text-dark">{user.name}</h2>
                        <p className="text-sm text-primary font-medium mt-1">{roleLabels[user.role] ?? user.role}</p>
                        <Badge variant="default" className="mt-2">{user.team} {t("Team")}</Badge>

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
                                <span>{user.team} {t("Team")}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-text-secondary">
                                <MapPin className="h-4 w-4 text-text-muted" />
                                <span>{t("Cairo, Egypt")}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-text-secondary">
                                <Calendar className="h-4 w-4 text-text-muted" />
                                <span>{t("Joined")} Jan 2025</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-text-secondary">
                                <Shield className="h-4 w-4 text-text-muted" />
                                <span>{t("Active Member")}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Sprint Performance */}
                <Card className="lg:col-span-2">
                    <CardContent className="p-6">
                        <h3 className="text-base sm:text-lg font-semibold text-text-dark mb-4">{t("Current Sprint Performance")}</h3>
                        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
                            <ScoreGauge score={sprintMetrics?.healthScore ?? 0} size="md" label={t("Sprint Health")} />
                            <div className="grid grid-cols-2 gap-3 sm:gap-4 flex-1 w-full">
                                <div className="rounded-xl bg-muted p-3 sm:p-4 text-center">
                                    <p className="text-xl sm:text-2xl font-bold text-text-dark">{tasks.length}</p>
                                    <p className="text-xs text-text-muted mt-1">{t("Assigned Tasks")}</p>
                                </div>
                                <div className="rounded-xl bg-success-light p-3 sm:p-4 text-center">
                                    <p className="text-xl sm:text-2xl font-bold text-success">{doneTasks}</p>
                                    <p className="text-xs text-text-muted mt-1">{t("Completed")}</p>
                                </div>
                                <div className="rounded-xl bg-warning-light p-3 sm:p-4 text-center">
                                    <p className="text-xl sm:text-2xl font-bold text-warning">{inProgressTasks}</p>
                                    <p className="text-xs text-text-muted mt-1">{t("In Progress")}</p>
                                </div>
                                <div className="rounded-xl bg-error-light p-3 sm:p-4 text-center">
                                    <p className="text-xl sm:text-2xl font-bold text-error">{blockedTasks}</p>
                                    <p className="text-xs text-text-muted mt-1">{t("Blocked")}</p>
                                </div>
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
                            {tasks.map((task) => (
                                <div key={task.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 rounded-xl border border-border p-3 hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className={cn("h-2.5 w-2.5 rounded-full shrink-0", task.phase === "done" ? "bg-success" : task.phase === "in_progress" ? "bg-warning" : task.phase === "review" ? "bg-[#8b5cf6]" : task.phase === "qa" ? "bg-[#ec4899]" : task.phase === "ready" ? "bg-primary" : "bg-text-muted")} />
                                        <span className="text-sm font-medium text-text-dark truncate">{task.title}</span>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        {task.hasBlocker && <Badge variant="error">{t("Blocked")}</Badge>}
                                        <Badge variant={task.priority === "critical" ? "error" : task.priority === "high" ? "warning" : "secondary"} className="text-[10px]">{t(task.priority.charAt(0).toUpperCase() + task.priority.slice(1))}</Badge>
                                        <span className="text-xs text-text-muted whitespace-nowrap">{t(task.phase === "in_progress" ? "In Progress" : task.phase.charAt(0).toUpperCase() + task.phase.slice(1))}</span>
                                        <span className="text-xs font-semibold text-text-muted bg-muted rounded-full h-5 w-5 flex items-center justify-center">{task.storyPoints}</span>
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
