import { useMemo } from "react";
import { ChevronLeft } from "lucide-react";

import { Button } from "@/atoms";
import { t } from "@/hooks";
import type {
    TimeEntityKind,
    TimeEntryInterface,
    TimeMemberInterface,
    TimeProjectInterface,
    TimeSprintInterface,
    TimeTaskInterface,
    TimeTeamInterface,
} from "@/interfaces/time";

interface TimeDetailProps {
    kind: TimeEntityKind;
    entityId: string;
    onBack: () => void;
    entries: TimeEntryInterface[];
    projects: TimeProjectInterface[];
    sprints: TimeSprintInterface[];
    teams: TimeTeamInterface[];
    members: TimeMemberInterface[];
    tasks: TimeTaskInterface[];
}

const StatTile = ({ label, value }: { label: string; value: string | number }) => (
    <div className="rounded-lg border border-border bg-card px-4 py-3">
        <p className="text-[11px] uppercase tracking-wide text-text-muted">{label}</p>
        <p className="text-xl font-bold text-text-dark mt-1">{value}</p>
    </div>
);

export const TimeDetail = ({
    kind,
    entityId,
    onBack,
    entries,
    projects,
    sprints,
    teams,
    members,
    tasks,
}: TimeDetailProps) => {
    const filteredEntries = useMemo(() => {
        switch (kind) {
            case "project":
                return entries.filter((e) => e.project_id === entityId);
            case "sprint":
                return entries.filter((e) => e.sprint_id === entityId);
            case "team":
                return entries.filter((e) => {
                    const member = members.find((m) => m.id === e.member_id);
                    return member?.team_id === entityId;
                });
            case "member":
                return entries.filter((e) => e.member_id === entityId);
        }
    }, [kind, entityId, entries, members]);

    const entity = useMemo(() => {
        switch (kind) {
            case "project":
                return projects.find((p) => p.id === entityId);
            case "sprint":
                return sprints.find((s) => s.id === entityId);
            case "team":
                return teams.find((team) => team.id === entityId);
            case "member":
                return members.find((m) => m.id === entityId);
        }
    }, [kind, entityId, projects, sprints, teams, members]);

    const title = useMemo(() => {
        if (!entity) return t("Unknown");
        if ("name" in entity) return entity.name;
        return (entity as TimeMemberInterface).full_name;
    }, [entity]);

    const subtitle = useMemo(() => {
        if (!entity) return "";
        if (kind === "project") return (entity as TimeProjectInterface).team_name;
        if (kind === "sprint") {
            const s = entity as TimeSprintInterface;
            return `${s.project_name} · ${s.start_date} → ${s.end_date}`;
        }
        if (kind === "team") return (entity as TimeTeamInterface).department;
        if (kind === "member") {
            const m = entity as TimeMemberInterface;
            const team = teams.find((tm) => tm.id === m.team_id);
            return [m.role_label, team?.name].filter(Boolean).join(" · ");
        }
        return "";
    }, [entity, kind, teams]);

    const totalHours = filteredEntries.reduce((acc, e) => acc + e.hours, 0);
    const entriesCount = filteredEntries.length;
    const activeMembers = new Set(filteredEntries.map((e) => e.member_id)).size;

    const memberBreakdown = useMemo(() => {
        const map = new Map<string, number>();
        filteredEntries.forEach((entry) => {
            map.set(entry.member_id, (map.get(entry.member_id) ?? 0) + entry.hours);
        });
        return Array.from(map.entries())
            .map(([memberId, hours]) => ({
                member: members.find((m) => m.id === memberId),
                hours,
            }))
            .filter((row): row is { member: TimeMemberInterface; hours: number } => !!row.member)
            .sort((a, b) => b.hours - a.hours);
    }, [filteredEntries, members]);

    const projectBreakdown = useMemo(() => {
        const map = new Map<string, number>();
        filteredEntries.forEach((entry) => {
            map.set(entry.project_id, (map.get(entry.project_id) ?? 0) + entry.hours);
        });
        return Array.from(map.entries())
            .map(([projectId, hours]) => ({
                project: projects.find((p) => p.id === projectId),
                hours,
            }))
            .filter((row): row is { project: TimeProjectInterface; hours: number } => !!row.project)
            .sort((a, b) => b.hours - a.hours);
    }, [filteredEntries, projects]);

    const topHours = Math.max(1, ...memberBreakdown.map((r) => r.hours));

    return (
        <div>
            <div className="flex items-start gap-3 mb-6">
                <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5 mt-1">
                    <ChevronLeft className="h-4 w-4" />
                    {t("Back")}
                </Button>
                <div>
                    <h2 className="text-xl font-bold text-text-dark">{title}</h2>
                    {subtitle && <p className="text-sm text-text-muted mt-0.5">{subtitle}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                <StatTile label={t("Total Hours")} value={totalHours} />
                <StatTile label={t("Entries")} value={entriesCount} />
                <StatTile label={t("Members Active")} value={activeMembers} />
            </div>

            {memberBreakdown.length > 0 && (
                <div className="rounded-lg border border-border bg-card p-4 mb-4">
                    <h3 className="text-sm font-semibold text-text-dark mb-3">{t("Member Breakdown")}</h3>
                    <div className="space-y-3">
                        {memberBreakdown.map(({ member, hours }) => (
                            <div key={member.id}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-text-dark">{member.full_name}</span>
                                    <span className="text-success font-semibold">{hours}h</span>
                                </div>
                                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                    <div className="h-full bg-success" style={{ width: `${(hours / topHours) * 100}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {projectBreakdown.length > 0 && kind !== "project" && (
                <div className="rounded-lg border border-border bg-card p-4 mb-4">
                    <h3 className="text-sm font-semibold text-text-dark mb-3">{t("Project Breakdown")}</h3>
                    <div className="space-y-2">
                        {projectBreakdown.map(({ project, hours }) => (
                            <div key={project.id} className="flex justify-between text-sm">
                                <span className="text-text-dark">{project.name}</span>
                                <span className="text-success font-semibold">{hours}h</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="rounded-lg border border-border bg-card overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                    <h3 className="text-sm font-semibold text-text-dark">{t("Time Log")}</h3>
                </div>
                {filteredEntries.length === 0 ? (
                    <p className="px-4 py-8 text-sm text-text-muted text-center">{t("No entries yet")}</p>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-text-muted">
                                <th className="px-4 py-2 font-medium">{t("Date")}</th>
                                <th className="px-4 py-2 font-medium">{t("Member")}</th>
                                <th className="px-4 py-2 font-medium">{t("Task")}</th>
                                <th className="px-4 py-2 font-medium">{t("Hours")}</th>
                                <th className="px-4 py-2 font-medium">{t("Note")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...filteredEntries]
                                .sort((a, b) => b.date.localeCompare(a.date))
                                .map((entry) => {
                                    const member = members.find((m) => m.id === entry.member_id);
                                    const task = tasks.find((tk) => tk.id === entry.task_id);
                                    return (
                                        <tr key={entry.id} className="border-t border-border">
                                            <td className="px-4 py-2 text-text-muted">{entry.date}</td>
                                            <td className="px-4 py-2 font-semibold text-text-dark">{member?.full_name ?? "—"}</td>
                                            <td className="px-4 py-2 text-text-dark">{task?.name ?? "—"}</td>
                                            <td className="px-4 py-2 text-success font-semibold">{entry.hours}</td>
                                            <td className="px-4 py-2 text-text-muted">{entry.note ?? "—"}</td>
                                        </tr>
                                    );
                                })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};
