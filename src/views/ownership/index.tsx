import { useState } from "react";
import { ClipboardList, FileCode, FolderKanban, Plus, Search, User, Users } from "lucide-react";

import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input } from "@/atoms";
import { AnimatedNumber, EmptyState, Header, Pagination } from "@/components/shared";
import {
    t,
    useOwnershipFeed,
    useOwnershipLeaderboard,
    useOwnershipStats,
    usePermissions,
    useUsersListLite,
} from "@/hooks";

import { FeatureFormDialog } from "./FeatureFormDialog";
import type { OwnershipFeedItemInterface } from "@/interfaces";
import { Avatar, AvatarFallback } from "@/ui";
import { cn, formatDate } from "@/utils";

const STATUS_VARIANT: Record<string, "default" | "success" | "warning" | "secondary"> = {
    draft: "warning",
    active: "default",
    shipped: "success",
    archived: "secondary",
};

const initialsFor = (name: string) =>
    name.split(/\s+/).filter(Boolean).map((p) => p[0]).slice(0, 2).join("").toUpperCase();

export const OwnershipView = () => {
    const p = usePermissions();
    const [query, setQuery] = useState("");
    const [creatorFilter, setCreatorFilter] = useState<string>("all");
    const [kindFilter, setKindFilter] = useState<"all" | "feature" | "task">("all");
    const [createOpen, setCreateOpen] = useState(false);

    const { stats, refetch: refetchStats } = useOwnershipStats();
    const { leaderboard, refetch: refetchLeaderboard } = useOwnershipLeaderboard();
    const { items, meta, isLoading, setPage, setPerPage, refetch: refetchFeed } = useOwnershipFeed({
        type: kindFilter,
        creator: creatorFilter === "all" ? undefined : creatorFilter,
        search: query || undefined,
    });

    const { users } = useUsersListLite();

    const handleFeatureCreated = () => {
        refetchFeed();
        refetchStats();
        refetchLeaderboard();
    };

    return (
        <div>
            <Header
                title={t("Ownership")}
                description={t("See who authored each feature and task across the platform")}
                actions={p.features.create() ? (
                    <Button size="sm" className="gap-1.5" onClick={() => setCreateOpen(true)}>
                        <Plus className="h-4 w-4" />
                        {t("Create Feature")}
                    </Button>
                ) : null}
            />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard icon={ClipboardList} label={t("Total Items")} value={stats?.total_items ?? 0} tone="primary" />
                <StatCard icon={FolderKanban} label={t("Features")} value={stats?.features ?? 0} tone="primary" />
                <StatCard icon={FileCode} label={t("Tasks")} value={stats?.tasks ?? 0} tone="primary" />
                <StatCard icon={Users} label={t("Contributors")} value={stats?.contributors ?? 0} tone="success" />
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
                        {users.map((u) => (
                            <option key={u.id} value={u.id}>{u.full_name}</option>
                        ))}
                    </select>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
                <div>
                    <h2 className="text-lg font-semibold text-text-dark mb-3">{t("Authorship Feed")}</h2>
                    {isLoading && items.length === 0 ? (
                        <div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-text-muted">
                            {t("Loading...")}
                        </div>
                    ) : items.length === 0 ? (
                        <EmptyState icon={User} title={t("No matches")} description={t("Try adjusting the filters")} />
                    ) : (
                        <>
                            <div className="grid grid-cols-1 gap-3">
                                {items.map((entry: OwnershipFeedItemInterface) => (
                                    <Card key={entry.id}>
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between gap-3 mb-2">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <span className={cn(
                                                        "flex h-7 w-7 items-center justify-center rounded-md shrink-0",
                                                        entry.type === "feature" ? "bg-primary-lighter text-primary" : "bg-success-light text-success",
                                                    )}>
                                                        {entry.type === "feature" ? <FolderKanban className="h-3.5 w-3.5" /> : <FileCode className="h-3.5 w-3.5" />}
                                                    </span>
                                                    <h3 className="text-sm font-semibold text-text-dark truncate">{entry.title}</h3>
                                                </div>
                                                <Badge variant={STATUS_VARIANT[entry.status] ?? "secondary"} className="text-[10px]">{t(entry.status)}</Badge>
                                            </div>
                                            {entry.description && <p className="text-xs text-text-muted mb-3">{entry.description}</p>}
                                            <div className="flex flex-wrap items-center gap-3 text-[11px] text-text-muted">
                                                <span className="flex items-center gap-1.5">
                                                    <Avatar className="h-5 w-5">
                                                        <AvatarFallback className="text-[8px]">
                                                            {entry.creator.avatar_initials ?? initialsFor(entry.creator.name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="font-semibold text-text-dark">{entry.creator.name}</span>
                                                </span>
                                                {entry.project_name && <span className="text-primary">{entry.project_name}</span>}
                                                <span>{t("Created")}: {formatDate(entry.created_at)}</span>
                                                <span>{t("Updated")}: {formatDate(entry.updated_at)}</span>
                                                {entry.linked_tasks_count > 0 && (
                                                    <span>{entry.linked_tasks_count} {t("linked tasks")}</span>
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
                                ))}
                            </div>
                            {meta && (
                                <div className="mt-4">
                                    <Pagination meta={meta} onPageChange={setPage} onPerPageChange={setPerPage} />
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div>
                    <h2 className="text-lg font-semibold text-text-dark mb-3">{t("Contributors")}</h2>
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm">{t("Top Authors")}</CardTitle></CardHeader>
                        <CardContent className="flex flex-col gap-3">
                            {leaderboard.map((entry, i) => (
                                <button
                                    key={entry.user_id}
                                    onClick={() => setCreatorFilter(entry.user_id)}
                                    className={cn(
                                        "flex items-center gap-3 text-start rounded-md p-2 -mx-2 transition-colors",
                                        creatorFilter === entry.user_id ? "bg-primary-lighter" : "hover:bg-muted/40",
                                    )}
                                >
                                    <span className="text-xs text-text-muted w-5 text-right shrink-0">#{i + 1}</span>
                                    <Avatar className="h-7 w-7 shrink-0">
                                        <AvatarFallback className="text-[10px]">
                                            {entry.avatar_initials ?? initialsFor(entry.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-semibold text-text-dark truncate">{entry.name}</p>
                                        <p className="text-[10px] text-text-muted">{entry.features} {t("features")} · {entry.tasks} {t("tasks")}</p>
                                    </div>
                                    <span className="text-sm font-bold text-primary"><AnimatedNumber value={entry.count} /></span>
                                </button>
                            ))}
                            {leaderboard.length === 0 && (
                                <p className="text-xs text-text-muted text-center py-2">{t("No contributors yet.")}</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <FeatureFormDialog
                open={createOpen}
                onOpenChange={setCreateOpen}
                onCreated={handleFeatureCreated}
            />
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
