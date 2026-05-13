import { useMemo, useState } from "react";
import { Bell, BellOff, BellPlus, Calendar, Filter, MoreHorizontal, Pencil, Search, Trash2, X } from "lucide-react";

import { Badge, Button, Card, CardContent, Input } from "@/atoms";
import { EmptyState, Header } from "@/components/shared";
import { ReminderStatus } from "@/enums";
import { t, usePermissions } from "@/hooks";
import type { ReminderInterface } from "@/interfaces";
import { useRemindersStore } from "@/store";
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

// ── Urgency model — drives color, label, ring intensity ───────────────────
interface Urgency {
    tone: "expired" | "today" | "critical" | "warning" | "soon" | "calm";
    label: string;
    color: string;        // text color class
    ring: string;         // bg color class for badge ring
    border: string;       // card hover border
    progress: string;     // progress fill color
    glow: string;         // optional shadow accent
}

const urgencyFor = (days: number): Urgency => {
    if (days < 0)   return { tone: "expired",  label: "Expired",   color: "text-text-faint",      ring: "bg-text-muted",         border: "hover:border-text-muted",     progress: "bg-text-muted",       glow: "" };
    if (days === 0) return { tone: "today",    label: "Today",     color: "text-error",           ring: "bg-error",              border: "hover:border-error/40",       progress: "bg-error",            glow: "shadow-[0_4px_20px_-8px_rgba(239,68,68,0.4)]" };
    if (days <= 3)  return { tone: "critical", label: "Critical",  color: "text-error",           ring: "bg-error",              border: "hover:border-error/40",       progress: "bg-error",            glow: "shadow-[0_4px_20px_-8px_rgba(239,68,68,0.3)]" };
    if (days <= 7)  return { tone: "warning",  label: "This week", color: "text-warning",         ring: "bg-warning",            border: "hover:border-warning/40",     progress: "bg-warning",          glow: "" };
    if (days <= 30) return { tone: "soon",     label: "Soon",      color: "text-primary",         ring: "bg-primary",            border: "hover:border-primary/40",     progress: "bg-primary",          glow: "" };
    return            { tone: "calm",     label: "Comfortable", color: "text-success",         ring: "bg-success",            border: "hover:border-success/40",     progress: "bg-success",          glow: "" };
};

type StatusTab = "all" | "active" | "expired" | "dismissed";

export const RemindersView = () => {
    const p = usePermissions();
    const reminders = useRemindersStore((s) => s.reminders);
    const removeReminder = useRemindersStore((s) => s.removeReminder);
    const setStatus = useRemindersStore((s) => s.setStatus);

    const [addOpen, setAddOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<ReminderInterface | null>(null);
    const [search, setSearch] = useState("");
    const [tab, setTab] = useState<StatusTab>("all");
    const [urgencyFilter, setUrgencyFilter] = useState<string>("all");
    const [sortBy, setSortBy] = useState<"date-asc" | "date-desc" | "created">("date-asc");

    // Auto-mark expired
    const annotated = useMemo(() => {
        return reminders.map((r) => {
            const days = daysUntil(r.expires_at);
            const isExpired = days < 0;
            const effectiveStatus = isExpired && r.status === ReminderStatus.Active ? ReminderStatus.Expired : r.status;
            return { ...r, _days: days, _status: effectiveStatus };
        });
    }, [reminders]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        let list = annotated.filter((r) => {
            if (tab !== "all" && r._status !== tab) return false;
            if (urgencyFilter !== "all") {
                const u = urgencyFor(r._days).tone;
                if (u !== urgencyFilter) return false;
            }
            if (q && !(r.title.toLowerCase().includes(q) || (r.description ?? "").toLowerCase().includes(q))) return false;
            return true;
        });
        if (sortBy === "date-asc") list.sort((a, b) => a._days - b._days);
        else if (sortBy === "date-desc") list.sort((a, b) => b._days - a._days);
        else list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        return list;
    }, [annotated, search, tab, urgencyFilter, sortBy]);

    const counts = useMemo(() => ({
        all: annotated.length,
        active: annotated.filter((r) => r._status === ReminderStatus.Active).length,
        expired: annotated.filter((r) => r._status === ReminderStatus.Expired).length,
        dismissed: annotated.filter((r) => r._status === ReminderStatus.Dismissed).length,
        critical: annotated.filter((r) => r._days >= 0 && r._days <= 3 && r._status === ReminderStatus.Active).length,
        thisWeek: annotated.filter((r) => r._days >= 0 && r._days <= 7 && r._status === ReminderStatus.Active).length,
    }), [annotated]);

    const clearFilters = () => {
        setSearch("");
        setUrgencyFilter("all");
        setTab("all");
    };
    const hasFilters = search || urgencyFilter !== "all" || tab !== "all";

    const canCreate = p.tasks.create();

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

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <Stat label={t("Total")}        value={counts.all}      accent="text-text-dark" />
                <Stat label={t("Active")}       value={counts.active}   accent="text-primary" />
                <Stat label={t("This Week")}    value={counts.thisWeek} accent="text-warning" />
                <Stat label={t("Critical (≤3d)")} value={counts.critical} accent="text-error" />
            </div>

            {/* Tabs + filters */}
            <Card className="mb-6">
                <CardContent className="p-4 flex flex-col gap-3">
                    <Tabs value={tab} onValueChange={(v) => setTab(v as StatusTab)}>
                        <TabsList>
                            <TabsTrigger value="all">{t("All")} <span className="ms-1.5 text-[10px] text-text-muted tabular-nums">{counts.all}</span></TabsTrigger>
                            <TabsTrigger value={ReminderStatus.Active}>{t("Active")} <span className="ms-1.5 text-[10px] text-text-muted tabular-nums">{counts.active}</span></TabsTrigger>
                            <TabsTrigger value={ReminderStatus.Expired}>{t("Expired")} <span className="ms-1.5 text-[10px] text-text-muted tabular-nums">{counts.expired}</span></TabsTrigger>
                            <TabsTrigger value={ReminderStatus.Dismissed}>{t("Dismissed")} <span className="ms-1.5 text-[10px] text-text-muted tabular-nums">{counts.dismissed}</span></TabsTrigger>
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
                        <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
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
                            {filtered.length} / {annotated.length}
                        </span>
                    </div>
                </CardContent>
            </Card>

            {/* List */}
            {filtered.length === 0 ? (
                <EmptyState
                    icon={Bell}
                    title={t("No reminders match")}
                    description={hasFilters ? t("Try clearing filters.") : t("Create your first reminder to get notified before things expire.")}
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filtered.map((r) => (
                        <ReminderCard
                            key={r.id}
                            r={r}
                            days={r._days}
                            isExpired={r._status === ReminderStatus.Expired}
                            isDismissed={r._status === ReminderStatus.Dismissed}
                            canEdit={canCreate}
                            onEdit={() => setEditTarget(r)}
                            onDelete={() => removeReminder(r.id)}
                            onDismiss={() => setStatus(r.id, ReminderStatus.Dismissed)}
                            onReactivate={() => setStatus(r.id, ReminderStatus.Active)}
                        />
                    ))}
                </div>
            )}

            <AddReminderDialog open={addOpen} onOpenChange={setAddOpen} />
            <AddReminderDialog open={!!editTarget} onOpenChange={(open) => { if (!open) setEditTarget(null); }} initial={editTarget} />
        </div>
    );
};

// ── Stat tile ────────────────────────────────────────────────────────────
const Stat = ({ label, value, accent }: { label: string; value: number; accent: string }) => (
    <Card>
        <CardContent className="p-4 text-center">
            <p className={cn("text-2xl font-bold tabular-nums", accent)}>{value}</p>
            <p className="text-[10px] uppercase tracking-[0.12em] text-text-muted mt-1">{label}</p>
        </CardContent>
    </Card>
);

// ── Reminder card — countdown left + content right ───────────────────────
interface ReminderCardProps {
    r: ReminderInterface;
    days: number;
    isExpired: boolean;
    isDismissed: boolean;
    canEdit: boolean;
    onEdit: () => void;
    onDelete: () => void;
    onDismiss: () => void;
    onReactivate: () => void;
}

const ReminderCard = ({ r, days, isExpired, isDismissed, canEdit, onEdit, onDelete, onDismiss, onReactivate }: ReminderCardProps) => {
    const u = urgencyFor(days);
    const displayDays = Math.abs(days);
    const isToday = days === 0;
    const isDimmed = isDismissed || isExpired;

    return (
        <Card className={cn("transition-all duration-200 overflow-hidden", u.border, u.glow, isDimmed && "opacity-60")}>
            <CardContent className="p-0">
                <div className="flex">
                    {/* Countdown column */}
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

                    {/* Content column */}
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

                            {canEdit && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="p-1.5 -m-1.5 rounded-md text-text-muted hover:text-text-dark hover:bg-muted">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={onEdit} className="gap-2 cursor-pointer">
                                            <Pencil className="h-3.5 w-3.5" /> {t("Edit")}
                                        </DropdownMenuItem>
                                        {!isDismissed ? (
                                            <DropdownMenuItem onClick={onDismiss} className="gap-2 cursor-pointer">
                                                <BellOff className="h-3.5 w-3.5" /> {t("Dismiss")}
                                            </DropdownMenuItem>
                                        ) : (
                                            <DropdownMenuItem onClick={onReactivate} className="gap-2 cursor-pointer">
                                                <Bell className="h-3.5 w-3.5" /> {t("Reactivate")}
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={onDelete} className="gap-2 text-error focus:text-error cursor-pointer">
                                            <Trash2 className="h-3.5 w-3.5" /> {t("Delete")}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>

                        {/* Meta + intervals */}
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
