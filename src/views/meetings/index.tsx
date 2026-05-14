import { useState } from "react";
import { Calendar, Clock, Link2, MapPin, Plus, Search, Users } from "lucide-react";

import { Badge, Button, Input, Label } from "@/atoms";
import { EmptyState, Header, Pagination } from "@/components/shared";
import { t, useMeetingsList } from "@/hooks";
import type { MeetingApiStatus, MeetingListItemInterface } from "@/interfaces";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/ui";
import { cn } from "@/utils";

import { MEETING_STATUS_LABEL, MEETING_STATUS_VARIANT } from "./constants";
import { MeetingDetail } from "./MeetingDetail";
import { RequestMeetingDialog } from "./RequestMeetingDialog";

type MeetingTab = "upcoming" | "past";

const todayIso = () => new Date().toISOString().slice(0, 10);

const computeDuration = (start?: string | null, end?: string | null) => {
    if (!start || !end) return null;
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    const mins = eh * 60 + em - (sh * 60 + sm);
    if (mins <= 0) return null;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
};

export const MeetingsView = () => {
    const [tab, setTab] = useState<MeetingTab>("upcoming");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<MeetingApiStatus | "all">("all");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [activeId, setActiveId] = useState<string | null>(null);
    const [createOpen, setCreateOpen] = useState(false);

    // For the Upcoming tab, fetch meetings on/after today; for Past, before today.
    // If user supplies explicit from/to, those win.
    const today = todayIso();
    const filters = {
        status: statusFilter !== "all" ? statusFilter : undefined,
        from: from || (tab === "upcoming" ? today : undefined),
        to: to || (tab === "past" ? today : undefined),
        search: search || undefined,
    };

    const { items, meta, isLoading, setPage, setPerPage, refetch } = useMeetingsList(filters);

    if (activeId) {
        return (
            <MeetingDetail
                meetingId={activeId}
                onBack={() => { setActiveId(null); refetch(); }}
            />
        );
    }

    const canReset = search !== "" || statusFilter !== "all" || from !== "" || to !== "";
    const handleReset = () => {
        setSearch("");
        setStatusFilter("all");
        setFrom("");
        setTo("");
    };

    return (
        <div>
            <Header title={t("Meetings")} description={t("Schedule, vote on, and run meetings with your team.")} />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_auto] gap-3 mb-4 p-4 rounded-lg border border-border bg-card">
                <div className="space-y-1.5">
                    <Label htmlFor="mt-search">{t("Search meetings…")}</Label>
                    <div className="relative">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                        <Input
                            id="mt-search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={t("Search meetings…")}
                            className="pl-8"
                        />
                    </div>
                </div>
                <div className="space-y-1.5">
                    <Label>{t("Status")}</Label>
                    <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as MeetingApiStatus | "all")}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t("All Statuses")}</SelectItem>
                            {(Object.keys(MEETING_STATUS_LABEL) as MeetingApiStatus[]).map((key) => (
                                <SelectItem key={key} value={key}>{t(MEETING_STATUS_LABEL[key])}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1.5">
                    <Label>{t("From")}</Label>
                    <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                    <Label>{t("To")}</Label>
                    <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
                </div>
                <div className="flex items-end gap-2">
                    {canReset && (
                        <Button variant="outline" size="sm" onClick={handleReset}>{t("Reset")}</Button>
                    )}
                    <Button size="sm" className="gap-1.5" onClick={() => setCreateOpen(true)}>
                        <Plus className="h-4 w-4" />
                        {t("Request a Meeting")}
                    </Button>
                </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
                <TabButton active={tab === "upcoming"} onClick={() => setTab("upcoming")}>{t("Upcoming")}</TabButton>
                <TabButton active={tab === "past"} onClick={() => setTab("past")}>{t("Past")}</TabButton>
            </div>

            {isLoading && items.length === 0 ? (
                <div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-text-muted">
                    {t("Loading meetings...")}
                </div>
            ) : items.length === 0 ? (
                <EmptyState
                    icon={Calendar}
                    title={tab === "upcoming" ? t("No upcoming meetings") : t("No past meetings")}
                    description={t("Adjust filters or request a new meeting to get started.")}
                />
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {items.map((meeting: MeetingListItemInterface) => {
                            const duration = computeDuration(meeting.start_time, meeting.end_time);
                            const time = meeting.start_time && meeting.end_time ? `${meeting.start_time} – ${meeting.end_time}` : t("TBD");
                            return (
                                <div key={meeting.id} className="rounded-lg border border-border bg-card p-5 flex flex-col">
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <div className="min-w-0">
                                            <h3 className="text-base font-semibold text-text-dark truncate">{meeting.title}</h3>
                                            <p className="text-xs text-text-muted truncate">{meeting.organizer.name}</p>
                                        </div>
                                        <Badge variant={MEETING_STATUS_VARIANT[meeting.status]} className="text-[10px]">
                                            {t(MEETING_STATUS_LABEL[meeting.status])}
                                        </Badge>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-xs text-text-dark mb-4 mt-2">
                                        <InfoLine icon={Calendar} value={meeting.date ?? t("TBD")} />
                                        <InfoLine icon={Clock} value={time} />
                                        {duration && <InfoLine icon={Clock} value={duration} />}
                                        {meeting.location && (
                                            <InfoLine icon={meeting.meeting_type === "remote" ? Link2 : MapPin} value={meeting.location} />
                                        )}
                                    </div>

                                    <div className="mt-auto flex items-center justify-between pt-3 border-t border-border">
                                        <span className="text-[11px] text-text-muted flex items-center gap-1">
                                            <Users className="h-3 w-3" />
                                            {meeting.attendees_count ?? 0} {t("attendees")}
                                        </span>
                                        <Button size="sm" variant="outline" onClick={() => setActiveId(meeting.id)}>
                                            {t("View Details")}
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {meta && <div className="mt-4"><Pagination meta={meta} onPageChange={setPage} onPerPageChange={setPerPage} /></div>}
                </>
            )}

            <RequestMeetingDialog
                open={createOpen}
                onOpenChange={setCreateOpen}
                onCreated={() => refetch()}
            />
        </div>
    );
};

interface TabButtonProps {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
}

const TabButton = ({ active, onClick, children }: TabButtonProps) => (
    <button
        type="button"
        onClick={onClick}
        className={cn(
            "px-4 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition-colors",
            active ? "bg-primary-lighter text-primary-medium" : "text-text-muted hover:text-text-dark hover:bg-accent",
        )}
    >
        {children}
    </button>
);

interface InfoLineProps {
    icon: typeof Calendar;
    value: string;
}

const InfoLine = ({ icon: Icon, value }: InfoLineProps) => (
    <span className="flex items-center gap-1.5 text-xs text-text-dark min-w-0">
        <Icon className="h-3.5 w-3.5 text-text-muted shrink-0" />
        <span className="truncate">{value}</span>
    </span>
);
