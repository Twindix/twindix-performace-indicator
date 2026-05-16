import { useState } from "react";
import { Plus } from "lucide-react";

import { Badge, Button } from "@/atoms";
import { Header } from "@/components/shared";
import {
    t,
    useAuth,
    useTimeByMember,
    useTimeByProject,
    useTimeBySprint,
    useTimeByTeam,
    useTimeSummary,
} from "@/hooks";
import { cn } from "@/utils";

import { TIME_STATUS_LABEL, TIME_STATUS_VARIANT, TIME_TABS, type TimeTabId } from "./constants";
import { LogTimeDialog } from "./LogTimeDialog";

const StatTile = ({ label, value }: { label: string; value: string | number }) => (
    <div className="rounded-lg border border-border bg-card px-4 py-3">
        <p className="text-[11px] uppercase tracking-wide text-text-muted">{label}</p>
        <p className="text-xl font-bold text-text-dark mt-1">{value}</p>
    </div>
);

const statusVariant = (status: string): "success" | "warning" | "secondary" | "default" => {
    if (status === "active") return "success";
    if (status === "planning") return "warning";
    return TIME_STATUS_VARIANT[status as keyof typeof TIME_STATUS_VARIANT] ?? "secondary";
};

const statusLabel = (status: string): string => {
    return TIME_STATUS_LABEL[status as keyof typeof TIME_STATUS_LABEL] ?? status;
};

const LoadingTile = () => (
    <div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-text-muted">
        {t("Loading time data...")}
    </div>
);

export const TimeView = () => {
    const { user } = useAuth();
    const [tab, setTab] = useState<TimeTabId>("projects");
    const [logOpen, setLogOpen] = useState(false);

    const { summary } = useTimeSummary();
    const { rows: projectRows, isLoading: loadingProjects, refetch: refetchProjects } = useTimeByProject();
    const { rows: sprintRows, isLoading: loadingSprints, refetch: refetchSprints } = useTimeBySprint();
    const { rows: teamRows, isLoading: loadingTeams, refetch: refetchTeams } = useTimeByTeam();
    const { rows: memberRows, isLoading: loadingMembers, refetch: refetchMembers } = useTimeByMember();

    const handleLogged = () => {
        refetchProjects();
        refetchSprints();
        refetchTeams();
        refetchMembers();
    };

    return (
        <div>
            <Header
                title={t("Time")}
                description={t("Track hours across projects, sprints, teams, and members.")}
                actions={
                    <Button size="sm" className="gap-1.5" onClick={() => setLogOpen(true)}>
                        <Plus className="h-4 w-4" />
                        {t("Log Time")}
                    </Button>
                }
            />

            <div className="flex items-center gap-1 mb-5 border-b border-border">
                {TIME_TABS.map((tabDef) => (
                    <button
                        key={tabDef.id}
                        type="button"
                        onClick={() => setTab(tabDef.id)}
                        className={cn(
                            "px-4 py-2 text-sm font-medium cursor-pointer transition-colors border-b-2 -mb-px",
                            tab === tabDef.id
                                ? "border-primary-medium text-primary-medium"
                                : "border-transparent text-text-muted hover:text-text-dark",
                        )}
                    >
                        {t(tabDef.label)}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                <StatTile label={t("Total Hours")} value={summary?.total_hours ?? 0} />
                <StatTile label={t("Entries")} value={summary?.total_entries ?? 0} />
                <StatTile label={t("Members Active")} value={summary?.active_members ?? 0} />
            </div>

            {tab === "projects" && (
                loadingProjects && projectRows.length === 0 ? <LoadingTile /> : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {projectRows.map((row) => (
                            <div key={row.project_id} className="rounded-lg border border-border bg-card p-5">
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <h3 className="text-base font-semibold text-text-dark truncate">{row.project_name}</h3>
                                    <Badge variant={statusVariant(row.project_status)} className="text-[10px]">
                                        {t(statusLabel(row.project_status))}
                                    </Badge>
                                </div>
                                <p className="text-xs text-text-muted mb-2">{row.team_name}</p>
                                <p className="text-sm font-bold text-text-dark mb-3">{row.total_hours} {t("h logged")}</p>
                                <div className="flex items-center justify-between text-[11px] text-text-muted mb-1">
                                    <span>{t("Progress")}</span>
                                    <span>{row.progress}%</span>
                                </div>
                                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                    <div className="h-full bg-success" style={{ width: `${row.progress}%` }} />
                                </div>
                                <p className="mt-3 text-[11px] text-text-muted">
                                    {row.active_members} {row.active_members === 1 ? t("member active") : t("members active")}
                                </p>
                            </div>
                        ))}
                    </div>
                )
            )}

            {tab === "sprints" && (
                loadingSprints && sprintRows.length === 0 ? <LoadingTile /> : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sprintRows.map((row) => (
                            <div key={row.sprint_id} className="rounded-lg border border-border bg-card p-5">
                                <div className="flex items-start justify-between gap-3 mb-2">
                                    <h3 className="text-base font-semibold text-text-dark truncate">{row.sprint_name}</h3>
                                    <Badge variant={statusVariant(row.sprint_status)} className="text-[10px]">
                                        {t(statusLabel(row.sprint_status))}
                                    </Badge>
                                </div>
                                <p className="text-xs text-text-muted">{row.project_name}</p>
                                {row.start_date && row.end_date && (
                                    <p className="text-xs text-text-muted mb-3">{row.start_date} → {row.end_date}</p>
                                )}
                                <p className="text-sm font-bold text-success">{row.total_hours} {t("h logged")}</p>
                                <p className="mt-2 text-[11px] text-text-muted">
                                    {row.active_members} {row.active_members === 1 ? t("member active") : t("members active")}
                                </p>
                            </div>
                        ))}
                    </div>
                )
            )}

            {tab === "teams" && (
                loadingTeams && teamRows.length === 0 ? <LoadingTile /> : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {teamRows.map((row) => (
                            <div key={row.team_id} className="rounded-lg border border-border bg-card p-5">
                                <h3 className="text-base font-semibold text-text-dark">{row.team_name}</h3>
                                {row.department && <p className="text-xs text-text-muted mb-3">{row.department}</p>}
                                <p className="text-sm font-bold text-success">{row.total_hours} {t("h logged")}</p>
                                <p className="mt-2 text-[11px] text-text-muted">
                                    {row.active_members} {row.active_members === 1 ? t("member active") : t("members active")}
                                </p>
                            </div>
                        ))}
                    </div>
                )
            )}

            {tab === "members" && (
                loadingMembers && memberRows.length === 0 ? <LoadingTile /> : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {memberRows.map((row) => (
                            <div key={row.member_id} className="rounded-lg border border-border bg-card p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-lighter text-primary-medium text-sm font-semibold">
                                        {row.avatar_initials ?? row.member_name.split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="text-base font-semibold text-text-dark">{row.member_name}</h3>
                                        {row.role && <p className="text-[11px] text-text-muted">{row.role}</p>}
                                    </div>
                                </div>
                                <p className="text-sm font-bold text-success">{row.total_hours} {t("h logged")}</p>
                                <p className="mt-2 text-[11px] text-text-muted">{row.total_entries} {t("entries")}</p>
                            </div>
                        ))}
                    </div>
                )
            )}

            <LogTimeDialog
                open={logOpen}
                onOpenChange={setLogOpen}
                currentUserId={user?.id ?? null}
                onLogged={handleLogged}
            />
        </div>
    );
};
