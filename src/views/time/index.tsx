import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { Badge, Button } from "@/atoms";
import { Header } from "@/components/shared";
import { timeSeed } from "@/data/seed";
import { t } from "@/hooks";
import type {
    CreateTimeEntryPayloadInterface,
    TimeEntityKind,
    TimeEntryInterface,
    TimeMemberInterface,
    TimeProjectInterface,
    TimeSprintInterface,
    TimeTeamInterface,
} from "@/interfaces/time";
import { cn } from "@/utils";

import { TIME_STATUS_LABEL, TIME_STATUS_VARIANT, TIME_TABS, type TimeTabId } from "./constants";
import { LogTimeDialog } from "./LogTimeDialog";
import { TimeDetail } from "./TimeDetail";

const StatTile = ({ label, value }: { label: string; value: string | number }) => (
    <div className="rounded-lg border border-border bg-card px-4 py-3">
        <p className="text-[11px] uppercase tracking-wide text-text-muted">{label}</p>
        <p className="text-xl font-bold text-text-dark mt-1">{value}</p>
    </div>
);

const hoursFor = (entries: TimeEntryInterface[], filter: (entry: TimeEntryInterface) => boolean) =>
    entries.filter(filter).reduce((acc, entry) => acc + entry.hours, 0);

const activeMembersFor = (entries: TimeEntryInterface[], filter: (entry: TimeEntryInterface) => boolean) =>
    new Set(entries.filter(filter).map((e) => e.member_id)).size;

export const TimeView = () => {
    const [tab, setTab] = useState<TimeTabId>("projects");
    const [detail, setDetail] = useState<{ kind: TimeEntityKind; id: string } | null>(null);
    const [entries, setEntries] = useState<TimeEntryInterface[]>(timeSeed.entries);
    const [logOpen, setLogOpen] = useState(false);

    const totalHours = useMemo(() => entries.reduce((acc, entry) => acc + entry.hours, 0), [entries]);
    const entriesCount = entries.length;
    const activeMembers = useMemo(() => new Set(entries.map((e) => e.member_id)).size, [entries]);

    const handleLog = (payload: CreateTimeEntryPayloadInterface) => {
        const newEntry: TimeEntryInterface = {
            id: `e-${Date.now()}`,
            date: payload.date,
            member_id: payload.member_id,
            project_id: payload.project_id,
            sprint_id: payload.sprint_id ?? null,
            task_id: payload.task_id ?? null,
            hours: payload.hours,
            note: payload.note,
        };
        setEntries((prev) => [newEntry, ...prev]);
    };

    if (detail) {
        return (
            <div>
                <TimeDetail
                    kind={detail.kind}
                    entityId={detail.id}
                    onBack={() => setDetail(null)}
                    entries={entries}
                    projects={timeSeed.projects}
                    sprints={timeSeed.sprints}
                    teams={timeSeed.teams}
                    members={timeSeed.members}
                    tasks={timeSeed.tasks}
                />
            </div>
        );
    }

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
                <StatTile label={t("Total Hours")} value={totalHours} />
                <StatTile label={t("Entries")} value={entriesCount} />
                <StatTile label={t("Members Active")} value={activeMembers} />
            </div>

            {tab === "projects" && (
                <ProjectsGrid
                    projects={timeSeed.projects}
                    entries={entries}
                    onOpen={(id) => setDetail({ kind: "project", id })}
                />
            )}
            {tab === "sprints" && (
                <SprintsGrid
                    sprints={timeSeed.sprints}
                    entries={entries}
                    onOpen={(id) => setDetail({ kind: "sprint", id })}
                />
            )}
            {tab === "teams" && (
                <TeamsGrid
                    teams={timeSeed.teams}
                    members={timeSeed.members}
                    entries={entries}
                    onOpen={(id) => setDetail({ kind: "team", id })}
                />
            )}
            {tab === "members" && (
                <MembersGrid
                    members={timeSeed.members}
                    entries={entries}
                    onOpen={(id) => setDetail({ kind: "member", id })}
                />
            )}

            <LogTimeDialog
                open={logOpen}
                onOpenChange={setLogOpen}
                members={timeSeed.members}
                projects={timeSeed.projects}
                sprints={timeSeed.sprints}
                tasks={timeSeed.tasks}
                onSubmit={handleLog}
            />
        </div>
    );
};

interface ProjectsGridProps {
    projects: TimeProjectInterface[];
    entries: TimeEntryInterface[];
    onOpen: (id: string) => void;
}

const ProjectsGrid = ({ projects, entries, onOpen }: ProjectsGridProps) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => {
            const hours = hoursFor(entries, (entry) => entry.project_id === project.id);
            const active = activeMembersFor(entries, (entry) => entry.project_id === project.id);
            return (
                <button
                    key={project.id}
                    onClick={() => onOpen(project.id)}
                    className="text-left rounded-lg border border-border bg-card p-5 hover:shadow-md transition-shadow cursor-pointer"
                >
                    <div className="flex items-start justify-between gap-3 mb-3">
                        <h3 className="text-base font-semibold text-text-dark truncate">{project.name}</h3>
                        <Badge variant={TIME_STATUS_VARIANT[project.status]} className="text-[10px]">
                            {t(TIME_STATUS_LABEL[project.status])}
                        </Badge>
                    </div>
                    <p className="text-xs text-text-muted mb-2">{project.team_name}</p>
                    <p className="text-sm font-bold text-text-dark mb-3">{hours} {t("h logged")}</p>
                    <div className="flex items-center justify-between text-[11px] text-text-muted mb-1">
                        <span>{t("Progress")}</span>
                        <span>{project.progress}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-success" style={{ width: `${project.progress}%` }} />
                    </div>
                    <p className="mt-3 text-[11px] text-text-muted">
                        {active} {active === 1 ? t("member active") : t("members active")}
                    </p>
                </button>
            );
        })}
    </div>
);

interface SprintsGridProps {
    sprints: TimeSprintInterface[];
    entries: TimeEntryInterface[];
    onOpen: (id: string) => void;
}

const SprintsGrid = ({ sprints, entries, onOpen }: SprintsGridProps) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sprints.map((sprint) => {
            const hours = hoursFor(entries, (entry) => entry.sprint_id === sprint.id);
            return (
                <button
                    key={sprint.id}
                    onClick={() => onOpen(sprint.id)}
                    className="text-left rounded-lg border border-border bg-card p-5 hover:shadow-md transition-shadow cursor-pointer"
                >
                    <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="text-base font-semibold text-text-dark truncate">{sprint.name}</h3>
                        <Badge variant={TIME_STATUS_VARIANT[sprint.status]} className="text-[10px]">
                            {t(TIME_STATUS_LABEL[sprint.status])}
                        </Badge>
                    </div>
                    <p className="text-xs text-text-muted">{sprint.project_name}</p>
                    <p className="text-xs text-text-muted mb-3">{sprint.start_date} → {sprint.end_date}</p>
                    <p className="text-sm font-bold text-success">{hours} {t("h logged")}</p>
                </button>
            );
        })}
    </div>
);

interface TeamsGridProps {
    teams: TimeTeamInterface[];
    members: TimeMemberInterface[];
    entries: TimeEntryInterface[];
    onOpen: (id: string) => void;
}

const TeamsGrid = ({ teams, members, entries, onOpen }: TeamsGridProps) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map((team) => {
            const memberIds = new Set(members.filter((m) => m.team_id === team.id).map((m) => m.id));
            const hours = hoursFor(entries, (entry) => memberIds.has(entry.member_id));
            const active = activeMembersFor(entries, (entry) => memberIds.has(entry.member_id));
            return (
                <button
                    key={team.id}
                    onClick={() => onOpen(team.id)}
                    className="text-left rounded-lg border border-border bg-card p-5 hover:shadow-md transition-shadow cursor-pointer"
                >
                    <h3 className="text-base font-semibold text-text-dark">{team.name}</h3>
                    <p className="text-xs text-text-muted mb-3">{team.department}</p>
                    <p className="text-sm font-bold text-success">{hours} {t("h logged")}</p>
                    <p className="mt-2 text-[11px] text-text-muted">
                        {active} {active === 1 ? t("member active") : t("members active")}
                    </p>
                </button>
            );
        })}
    </div>
);

interface MembersGridProps {
    members: TimeMemberInterface[];
    entries: TimeEntryInterface[];
    onOpen: (id: string) => void;
}

const MembersGrid = ({ members, entries, onOpen }: MembersGridProps) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((member) => {
            const hours = hoursFor(entries, (entry) => entry.member_id === member.id);
            const entryCount = entries.filter((e) => e.member_id === member.id).length;
            return (
                <button
                    key={member.id}
                    onClick={() => onOpen(member.id)}
                    className="text-left rounded-lg border border-border bg-card p-5 hover:shadow-md transition-shadow cursor-pointer"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-lighter text-primary-medium text-sm font-semibold">
                            {member.avatar_initials}
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-text-dark">{member.full_name}</h3>
                            {member.role_label && <p className="text-[11px] text-text-muted">{member.role_label}</p>}
                        </div>
                    </div>
                    <p className="text-sm font-bold text-success">{hours} {t("h logged")}</p>
                    <p className="mt-2 text-[11px] text-text-muted">{entryCount} {t("entries")}</p>
                </button>
            );
        })}
    </div>
);
