import { useMemo, useState } from "react";
import { ClipboardList, FileCode, FolderKanban, Search, User, Users } from "lucide-react";

import { Badge, Card, CardContent, CardHeader, CardTitle, Input } from "@/atoms";
import { AnimatedNumber, EmptyState, Header } from "@/components/shared";
import { authorshipSeed } from "@/data";

const timeSeed = {
    members: [] as Array<{ id: string; full_name: string; avatar_initials: string; role_label?: string; team_id?: string }>,
    projects: [] as Array<{ id: string; name: string }>,
};
import { t } from "@/hooks";
import type { AuthorshipEntryInterface, TimeMemberInterface } from "@/interfaces";
import { Avatar, AvatarFallback } from "@/ui";
import { cn, formatDate } from "@/utils";

const STATUS_VARIANT: Record<AuthorshipEntryInterface["status"], "default" | "success" | "warning" | "secondary"> = {
    draft: "warning",
    active: "default",
    shipped: "success",
    archived: "secondary",
};

export const OwnershipView = () => {
    const [query, setQuery] = useState("");
    const [creatorFilter, setCreatorFilter] = useState<string>("all");
    const [kindFilter, setKindFilter] = useState<"all" | "feature" | "task">("all");

    const getMember = (id: string) => timeSeed.members.find((m) => m.id === id);
    const getProject = (id: string) => timeSeed.projects.find((p) => p.id === id);

    const filtered = useMemo(() => authorshipSeed.filter((entry) => {
        if (kindFilter !== "all" && entry.kind !== kindFilter) return false;
        if (creatorFilter !== "all" && entry.creator_id !== creatorFilter) return false;
        if (query && !(`${entry.name} ${entry.description}`.toLowerCase().includes(query.toLowerCase()))) return false;
        return true;
    }), [query, creatorFilter, kindFilter]);

    const leaderboard = useMemo(() => {
        const map = new Map<string, { member?: TimeMemberInterface; count: number; features: number; tasks: number }>();
        authorshipSeed.forEach((entry) => {
            const current = map.get(entry.creator_id) ?? { member: getMember(entry.creator_id), count: 0, features: 0, tasks: 0 };
            current.count += 1;
            if (entry.kind === "feature") current.features += 1;
            else current.tasks += 1;
            map.set(entry.creator_id, current);
        });
        return Array.from(map.values()).sort((a, b) => b.count - a.count);
    }, []);

    const stats = useMemo(() => ({
        total: authorshipSeed.length,
        features: authorshipSeed.filter((e) => e.kind === "feature").length,
        tasks: authorshipSeed.filter((e) => e.kind === "task").length,
        contributors: leaderboard.length,
    }), [leaderboard]);

    if (authorshipSeed.length === 0) {
        return (
            <div>
                <Header title={t("Ownership")} description={t("See who authored each feature and task")} />
                <EmptyState icon={User} title={t("No authorship data")} description={t("No authorship records yet")} />
            </div>
        );
    }

    return (
        <div>
            <Header title={t("Ownership")} description={t("See who authored each feature and task across the platform")} />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard icon={ClipboardList} label={t("Total Items")} value={stats.total} tone="primary" />
                <StatCard icon={FolderKanban} label={t("Features")} value={stats.features} tone="primary" />
                <StatCard icon={FileCode} label={t("Tasks")} value={stats.tasks} tone="primary" />
                <StatCard icon={Users} label={t("Contributors")} value={stats.contributors} tone="success" />
            </div>

            <Card className="mb-6">
                <CardContent className="p-4 flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                        <Input placeholder={t("Search features or tasks…")} value={query} onChange={(e) => setQuery(e.target.value)} className="ps-9" />
                    </div>
                    <select
                        value={kindFilter}
                        onChange={(e) => setKindFilter(e.target.value as typeof kindFilter)}
                        className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                    >
                        <option value="all">{t("All Types")}</option>
                        <option value="feature">{t("Features")}</option>
                        <option value="task">{t("Tasks")}</option>
                    </select>
                    <select
                        value={creatorFilter}
                        onChange={(e) => setCreatorFilter(e.target.value)}
                        className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                    >
                        <option value="all">{t("All Creators")}</option>
                        {timeSeed.members.map((m) => (
                            <option key={m.id} value={m.id}>{m.full_name}</option>
                        ))}
                    </select>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
                <div>
                    <h2 className="text-lg font-semibold text-text-dark mb-3">{t("Authorship Feed")}</h2>
                    <div className="grid grid-cols-1 gap-3">
                        {filtered.map((entry) => {
                            const creator = getMember(entry.creator_id);
                            const project = getProject(entry.project_id);
                            return (
                                <Card key={entry.id}>
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between gap-3 mb-2">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className={cn(
                                                    "flex h-7 w-7 items-center justify-center rounded-md shrink-0",
                                                    entry.kind === "feature" ? "bg-primary-lighter text-primary" : "bg-success-light text-success",
                                                )}>
                                                    {entry.kind === "feature" ? <FolderKanban className="h-3.5 w-3.5" /> : <FileCode className="h-3.5 w-3.5" />}
                                                </span>
                                                <h3 className="text-sm font-semibold text-text-dark truncate">{entry.name}</h3>
                                            </div>
                                            <Badge variant={STATUS_VARIANT[entry.status]} className="text-[10px]">{t(entry.status)}</Badge>
                                        </div>
                                        <p className="text-xs text-text-muted mb-3">{entry.description}</p>
                                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-text-muted">
                                            <span className="flex items-center gap-1.5">
                                                <Avatar className="h-5 w-5"><AvatarFallback className="text-[8px]">{creator?.avatar_initials ?? "?"}</AvatarFallback></Avatar>
                                                <span className="font-semibold text-text-dark">{creator?.full_name ?? "Unknown"}</span>
                                            </span>
                                            {project && <span className="text-primary">{project.name}</span>}
                                            <span>{t("Created")}: {formatDate(entry.created_at)}</span>
                                            <span>{t("Updated")}: {formatDate(entry.updated_at)}</span>
                                            {entry.linked_task_ids.length > 0 && (
                                                <span>{entry.linked_task_ids.length} {t("linked tasks")}</span>
                                            )}
                                        </div>
                                        {entry.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {entry.tags.map((tag) => (
                                                    <span key={tag} className="text-[10px] text-text-muted bg-muted/60 px-1.5 py-0.5 rounded">{tag}</span>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                        {filtered.length === 0 && (
                            <EmptyState icon={User} title={t("No matches")} description={t("Try adjusting the filters")} />
                        )}
                    </div>
                </div>

                <div>
                    <h2 className="text-lg font-semibold text-text-dark mb-3">{t("Contributors")}</h2>
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm">{t("Top Authors")}</CardTitle></CardHeader>
                        <CardContent className="flex flex-col gap-3">
                            {leaderboard.map(({ member, count, features, tasks }, i) => (
                                <button
                                    key={member?.id ?? i}
                                    onClick={() => setCreatorFilter(member?.id ?? "all")}
                                    className={cn(
                                        "flex items-center gap-3 text-start rounded-md p-2 -mx-2 transition-colors",
                                        creatorFilter === member?.id ? "bg-primary-lighter" : "hover:bg-muted/40",
                                    )}
                                >
                                    <span className="text-xs text-text-muted w-5 text-right shrink-0">#{i + 1}</span>
                                    <Avatar className="h-7 w-7 shrink-0"><AvatarFallback className="text-[10px]">{member?.avatar_initials ?? "?"}</AvatarFallback></Avatar>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-semibold text-text-dark truncate">{member?.full_name ?? "Unknown"}</p>
                                        <p className="text-[10px] text-text-muted">{features} {t("features")} · {tasks} {t("tasks")}</p>
                                    </div>
                                    <span className="text-sm font-bold text-primary"><AnimatedNumber value={count} /></span>
                                </button>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

interface StatCardProps {
    icon: typeof Users;
    label: string;
    value: number;
    tone: "primary" | "success";
}

const StatCard = ({ icon: Icon, label, value, tone }: StatCardProps) => {
    const toneBg = tone === "success" ? "bg-success-light" : "bg-primary-lighter";
    const toneFg = tone === "success" ? "text-success" : "text-primary";
    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex items-center gap-3">
                    <div className={cn("flex h-10 w-10 items-center justify-center rounded-full", toneBg)}>
                        <Icon className={cn("h-5 w-5", toneFg)} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-text-dark"><AnimatedNumber value={value} /></p>
                        <p className="text-xs text-text-muted">{label}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
