import { useMemo, useState } from "react";
import { Bell, BellOff, BellPlus, Calendar, Filter, MoreHorizontal, Pencil, Search, Trash2, X } from "lucide-react";

import { Badge, Button, Card, CardContent, Input } from "@/atoms";
import { EmptyState, Header, Pagination } from "@/components/shared";
import { ReminderStatus } from "@/enums";
import {
    t,
    useDeleteReminder,
    useDismissReminder,
    usePermissions,
    useReactivateReminder,
    useRemindersList,
    useRemindersStats,
} from "@/hooks";
import type { ReminderInterface, ReminderUrgency } from "@/interfaces";
import { Avatar, AvatarFallback, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Tabs, TabsList, TabsTrigger } from "@/ui";
import { cn, formatDate } from "@/utils";
import { AddReminderDialog } from "./AddReminderDialog";

const DAY_MS = 86_400_000;

const daysUntil = (iso: string): number => {
    const target = new Date(iso);
    target.setHours(23, 59, 59, 999);
    const now = new Date();
    return Math.ceil((target.getTime() - now.getTime()) / DAY_MS);
};

const formatInterval = (d: number): string => {
    if (d === 1) return "1d";
    if (d < 7) return `${d}d`;
    if (d === 7) return "1w";
    if (d === 14) return "2w";
    if (d % 7 === 0 && d < 30) return `${d / 7}w`;
    if (d === 30) return "1m";
    return `${d}d`;
};

interface Urgency {
    tone: ReminderUrgency;
    label: string;
    color: string;
    ring: string;
    border: string;
    progress: string;
    glow: string;
}

const urgencyFor = (days: number): Urgency => {
    if (days < 0)   return { tone: "expired",  label: "Expired",   color: "text-text-faint", ring: "bg-text-muted", border: "hover:border-text-muted", progress: "bg-text-muted", glow: "" };
    if (days === 0) return { tone: "today",    label: "Today",     color: "text-error",      ring: "bg-error",      border: "hover:border-error/40",   progress: "bg-error",      glow: "shadow-[0_4px_20px_-8px_rgba(239,68,68,0.4)]" };
    if (days <= 3)  return { tone: "critical", label: "Critical",  color: "text-error",      ring: "bg-error",      border: "hover:border-error/40",   progress: "bg-error",      glow: "shadow-[0_4px_20px_-8px_rgba(239,68,68,0.3)]" };
    if (days <= 7)  return { tone: "warning",  label: "This week", color: "text-warning",    ring: "bg-warning",    border: "hover:border-warning/40", progress: "bg-warning",    glow: "" };
    if (days <= 30) return { tone: "soon",     label: "Soon",      color: "text-primary",    ring: "bg-primary",    border: "hover:border-primary/40", progress: "bg-primary",    glow: "" };
    return            { tone: "calm",     label: "Comfortable", color: "text-success",  ring: "bg-success",    border: "hover:border-success/40", progress: "bg-success",    glow: "" };
};

type StatusTab = "all" | ReminderStatus;

export const RemindersView = () => {
    const p = usePermissions();
    const canCreate = p.reminders.create();
    const canEdit = p.reminders.edit();
    const canDismiss = p.reminders.dismiss();

    const [addOpen, setAddOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<ReminderInterface | null>(null);
    const [search, setSearch] = useState("");
    const [tab, setTab] = useState<StatusTab>("all");
    const [urgencyFilter, setUrgencyFilter] = useState<ReminderUrgency | "all">("all");
    const [sortBy, setSortBy] = useState<"date-asc" | "date-desc" | "created">("date-asc");

    const filters = {
        status: tab !== "all" ? tab : undefined,
        urgency: urgencyFilter !== "all" ? urgencyFilter : undefined,
        search: search || undefined,
        sort: sortBy,
    };

    const { items, meta, isLoading, setPage, setPerPage, refetch, prependReminderLocal, patchReminderLocal, removeReminderLocal } = useRemindersList(filters);
    const { stats, refetch: refetchStats } = useRemindersStats();
    const { dismissHandler } = useDismissReminder();
    const { reactivateHandler } = useReactivateReminder();
    const { deleteHandler } = useDeleteReminder();

    const annotated = useMemo(() => items.map((r) => ({ ...r, _days: daysUntil(r.expires_at) })), [items]);

    const handleSaved = (r: ReminderInterface) => {
        if (editTarget) {
            patchReminderLocal(r);
            setEditTarget(null);
        } else {
            prependReminderLocal(r);
        }
        refetch();
        refetchStats();
    };

    const handleDismiss = async (r: ReminderInterface) => {
        const updated = await dismissHandler(r.id);
        if (updated) {
            patchReminderLocal(updated);
            refetchStats();
        }
    };

    const handleReactivate = async (r: ReminderInterface) => {
        const updated = await reactivateHandler(r.id);
        if (updated) {
            patchReminderLocal(updated);
            refetchStats();
        }
    };

    const handleDelete = async (r: ReminderInterface) => {
        const ok = await deleteHandler(r.id);
        if (ok) {
            removeReminderLocal(r.id);
            refetchStats();
        }
    };

    const clearFilters = () => {
        setSearch("");
        setUrgencyFilter("all");
        setTab("all");
    };
    const hasFilters = search || urgencyFilter !== "all" || tab !== "all";

    return (
        <div className="flex-1 flex flex-col">
            <Header
                title={t("Reminders")}
                description={t("Subscription, certificate, and renewal alerts. Get pinged at each interval before expiry.")}
                actions={
                    canCreate ? (
                        <Button size="sm" className="gap-1.5" onClick={() => setAddOpen(true)}>
                            <BellPlus className="h-4 w-4" />
                            {t("New Reminder")}
                        </Button>
                    ) : null
                }
            />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <Stat label={t("Total")}        value={stats?.total ?? 0}     accent="text-text-dark" />
                <Stat label={t("Active")}       value={stats?.active ?? 0}    accent="text-primary" />
                <Stat label={t("This Week")}    value={stats?.this_week ?? 0} accent="text-warning" />
                <Stat label={t("Critical (≤3d)")} value={stats?.critical ?? 0} accent="text-error" />
            </div>

            <Card className="mb-6">
                <CardContent className="p-4 flex flex-col gap-3">
                    <Tabs value={tab} onValueChange={(v) => setTab(v as StatusTab)}>
                        <TabsList>
                            <TabsTrigger value="all">{t("All")} <span className="ms-1.5 text-[10px] text-text-muted tabular-nums">{stats?.total ?? 0}</span></TabsTrigger>
                            <TabsTrigger value={ReminderStatus.Active}>{t("Active")} <span className="ms-1.5 text-[10px] text-text-muted tabular-nums">{stats?.active ?? 0}</span></TabsTrigger>
                            <TabsTrigger value={ReminderStatus.Expired}>{t("Expired")} <span className="ms-1.5 text-[10px] text-text-muted tabular-nums">{stats?.expired ?? 0}</span></TabsTrigger>
                            <TabsTrigger value={ReminderStatus.Dismissed}>{t("Dismissed")} <span className="ms-1.5 text-[10px] text-text-muted tabular-nums">{stats?.dismissed ?? 0}</span></TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <div className="flex flex-wrap items-center gap-2">
                        <div className="relative flex-1 min-w-[200px] max-w-sm">
                            <Search className="absolute top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" style={{ insetInlineStart: 12 }} />
                            <Input
                                placeholder={t("Search reminders…")}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                style={{ paddingInlineStart: 40 }}
                            />
                        </div>
                        <Filter className="h-4 w-4 text-text-muted hidden sm:block" />
                        <Select value={urgencyFilter} onValueChange={(v) => setUrgencyFilter(v as ReminderUrgency | "all")}>
                            <SelectTrigger className="w-[150px] h-9 text-xs"><SelectValue placeholder={t("Urgency")} /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t("All Urgencies")}</SelectItem>
                                <SelectItem value="today">{t("Due Today")}</SelectItem>
                                <SelectItem value="critical">{t("Critical (≤3d)")}</SelectItem>
                                <SelectItem value="warning">{t("This Week")}</SelectItem>
                                <SelectItem value="soon">{t("Soon (≤30d)")}</SelectItem>
                                <SelectItem value="calm">{t("Comfortable")}</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                            <SelectTrigger className="w-[160px] h-9 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="date-asc">{t("Soonest first")}</SelectItem>
                                <SelectItem value="date-desc">{t("Latest first")}</SelectItem>
                                <SelectItem value="created">{t("Recently added")}</SelectItem>
                            </SelectContent>
                        </Select>
                        {hasFilters && (
                            <button onClick={clearFilters} className="text-xs text-text-muted hover:text-text-dark flex items-center gap-1">
                                <X className="h-3 w-3" /> {t("Clear")}
                            </button>
                        )}
                        <span className="ms-auto text-xs text-text-muted tabular-nums">
                            {items.length} / {meta?.total ?? items.length}
                        </span>
                    </div>
                </CardContent>
            </Card>

            {isLoading && items.length === 0 ? (
                <div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-text-muted">
                    {t("Loading reminders...")}
                </div>
            ) : items.length === 0 ? (
                <EmptyState
                    icon={Bell}
                    title={t("No reminders match")}
                    description={hasFilters ? t("Try clearing filters.") : t("Create your first reminder to get notified before things expire.")}
                />
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {annotated.map((r) => (
                            <ReminderCard
                                key={r.id}
                                r={r}
                                days={r._days}
                                isExpired={r.status === ReminderStatus.Expired}
                                isDismissed={r.status === ReminderStatus.Dismissed}
                                canEdit={canEdit}
                                canDismiss={canDismiss}
                                onEdit={() => setEditTarget(r)}
                                onDelete={() => handleDelete(r)}
                                onDismiss={() => handleDismiss(r)}
                                onReactivate={() => handleReactivate(r)}
                            />
                        ))}
                    </div>
                    {meta && <div className="mt-4"><Pagination meta={meta} onPageChange={setPage} onPerPageChange={setPerPage} /></div>}
                </>
            )}

            <AddReminderDialog open={addOpen} onOpenChange={setAddOpen} onSaved={handleSaved} />
            <AddReminderDialog
                open={!!editTarget}
                onOpenChange={(open) => { if (!open) setEditTarget(null); }}
                initial={editTarget}
                onSaved={handleSaved}
            />
        </div>
    );
};

const Stat = ({ label, value, accent }: { label: string; value: number; accent: string }) => (
    <Card>
        <CardContent className="p-4 text-center">
            <p className={cn("text-2xl font-bold tabular-nums", accent)}>{value}</p>
            <p className="text-[10px] uppercase tracking-[0.12em] text-text-muted mt-1">{label}</p>
        </CardContent>
    </Card>
);

interface ReminderCardProps {
    r: ReminderInterface;
    days: number;
    isExpired: boolean;
    isDismissed: boolean;
    canEdit: boolean;
    canDismiss: boolean;
    onEdit: () => void;
    onDelete: () => void;
    onDismiss: () => void;
    onReactivate: () => void;
}

const ReminderCard = ({ r, days, isExpired, isDismissed, canEdit, canDismiss, onEdit, onDelete, onDismiss, onReactivate }: ReminderCardProps) => {
    const u = urgencyFor(days);
    const displayDays = Math.abs(days);
    const isToday = days === 0;
    const isDimmed = isDismissed || isExpired;

    return (
        <Card className={cn("transition-all duration-200 overflow-hidden", u.border, u.glow, isDimmed && "opacity-60")}>
            <CardContent className="p-0">
                <div className="flex">
                    <div className={cn(
                        "flex flex-col items-center justify-center px-5 py-4 shrink-0 min-w-[88px] border-e border-border/60 relative",
                        "bg-gradient-to-br from-transparent to-muted/30",
                    )}>
                        <span aria-hidden className={cn("absolute inset-y-0 start-0 w-1", u.ring)} />
                        {isExpired ? (
                            <>
                                <p className={cn("text-3xl font-bold tabular-nums leading-none", u.color)}>
                                    {displayDays}
                                </p>
                                <p className="text-[9px] uppercase tracking-[0.18em] text-text-muted mt-1.5 font-semibold">
                                    {t("days ago")}
                                </p>
                            </>
                        ) : isToday ? (
                            <>
                                <p className={cn("text-2xl font-bold leading-none", u.color)}>{t("TODAY")}</p>
                                <p className="text-[9px] uppercase tracking-[0.18em] text-text-muted mt-1.5 font-semibold">{t("expires")}</p>
                            </>
                        ) : (
                            <>
                                <p className={cn("text-3xl font-bold tabular-nums leading-none", u.color)}>
                                    {displayDays}
                                </p>
                                <p className="text-[9px] uppercase tracking-[0.18em] text-text-muted mt-1.5 font-semibold">
                                    {displayDays === 1 ? t("day left") : t("days left")}
                                </p>
                            </>
                        )}
                    </div>

                    <div className="flex-1 min-w-0 p-4">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="outline" className={cn("text-[9px] uppercase tracking-wider", u.color)}>
                                        {t(u.label)}
                                    </Badge>
                                    {isDismissed && <Badge variant="secondary" className="text-[9px]">{t("Dismissed")}</Badge>}
                                </div>
                                <h3 className="text-sm font-bold text-text-dark truncate">{r.title}</h3>
                                {r.description && (
                                    <p className="text-xs text-text-secondary mt-1 line-clamp-2">{r.description}</p>
                                )}
                            </div>

                            {(canEdit || canDismiss) && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="p-1.5 -m-1.5 rounded-md text-text-muted hover:text-text-dark hover:bg-muted">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        {canEdit && (
                                            <DropdownMenuItem onClick={onEdit} className="gap-2 cursor-pointer">
                                                <Pencil className="h-3.5 w-3.5" /> {t("Edit")}
                                            </DropdownMenuItem>
                                        )}
                                        {canDismiss && !isDismissed ? (
                                            <DropdownMenuItem onClick={onDismiss} className="gap-2 cursor-pointer">
                                                <BellOff className="h-3.5 w-3.5" /> {t("Dismiss")}
                                            </DropdownMenuItem>
                                        ) : canDismiss && isDismissed ? (
                                            <DropdownMenuItem onClick={onReactivate} className="gap-2 cursor-pointer">
                                                <Bell className="h-3.5 w-3.5" /> {t("Reactivate")}
                                            </DropdownMenuItem>
                                        ) : null}
                                        {canEdit && (
                                            <>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={onDelete} className="gap-2 text-error focus:text-error cursor-pointer">
                                                    <Trash2 className="h-3.5 w-3.5" /> {t("Delete")}
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>

                        <div className="flex items-center gap-3 mt-3 flex-wrap">
                            <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
                                <Calendar className="h-3 w-3" />
                                <span className="tabular-nums">{formatDate(r.expires_at)}</span>
                            </div>
                            <div className="flex items-center gap-1 flex-wrap">
                                <Bell className="h-3 w-3 text-text-muted" />
                                {r.notify_before_days.map((d) => (
                                    <span
                                        key={d}
                                        className="inline-flex items-center justify-center min-w-[26px] h-5 px-1.5 rounded-md bg-primary/10 text-primary text-[10px] font-semibold tabular-nums"
                                    >
                                        {formatInterval(d)}
                                    </span>
                                ))}
                            </div>
                            <div className="flex items-center gap-1.5 ms-auto">
                                <Avatar className="h-5 w-5">
                                    <AvatarFallback className="text-[8px]">{r.created_by.avatar_initials}</AvatarFallback>
                                </Avatar>
                                <span className="text-[11px] text-text-muted truncate max-w-[120px]">{r.created_by.full_name}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
