import { useMemo, useState } from "react";
import { Calendar, Clock, Link2, MapPin, Plus, Search, Users } from "lucide-react";

import { Badge, Button, Input, Label } from "@/atoms";
import { EmptyState, Header } from "@/components/shared";
import { meetingsSeed } from "@/data/seed";
import { AttendeeRsvp, MeetingStatus, MeetingType } from "@/enums";
import { t, useAuth } from "@/hooks";
import type {
    MeetingAttachmentInterface,
    MeetingCommentInterface,
    MeetingInterface,
    MeetingTimeSlotInterface,
    MeetingUserInterface,
    RequestMeetingPayloadInterface,
} from "@/interfaces/meetings";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/ui";
import { cn } from "@/utils";

import { MEETING_STATUS_LABEL, MEETING_STATUS_VARIANT } from "./constants";
import { MeetingDetail } from "./MeetingDetail";
import { RequestMeetingDialog } from "./RequestMeetingDialog";

type MeetingTab = "upcoming" | "past";

const todayIso = () => new Date().toISOString().slice(0, 10);

const isPast = (meeting: MeetingInterface) => {
    if (meeting.status === MeetingStatus.Completed || meeting.status === MeetingStatus.Cancelled) return true;
    if (!meeting.date) return false;
    return meeting.date < todayIso();
};

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
    const { user } = useAuth();
    const currentUserId = user?.id ?? meetingsSeed.users[0].id;
    const currentUserMeetingInfo = useMemo<MeetingUserInterface>(
        () =>
            user
                ? {
                    id: user.id,
                    full_name: user.full_name,
                    avatar_initials: user.avatar_initials,
                    role_label: user.role_label ?? undefined,
                }
                : meetingsSeed.users[0],
        [user],
    );

    const [meetings, setMeetings] = useState<MeetingInterface[]>(meetingsSeed.meetings);
    const [tab, setTab] = useState<MeetingTab>("upcoming");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<MeetingStatus | "all">("all");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [activeId, setActiveId] = useState<string | null>(null);
    const [createOpen, setCreateOpen] = useState(false);

    const filtered = useMemo(() => {
        return meetings.filter((meeting) => {
            const pastFlag = isPast(meeting);
            if (tab === "upcoming" && pastFlag) return false;
            if (tab === "past" && !pastFlag) return false;
            if (statusFilter !== "all" && meeting.status !== statusFilter) return false;
            if (search && !meeting.title.toLowerCase().includes(search.toLowerCase())) return false;
            if (from && meeting.date && meeting.date < from) return false;
            if (to && meeting.date && meeting.date > to) return false;
            return true;
        });
    }, [meetings, tab, statusFilter, search, from, to]);

    const activeMeeting = meetings.find((m) => m.id === activeId) ?? null;

    const patchMeeting = (id: string, patcher: (meeting: MeetingInterface) => MeetingInterface) => {
        setMeetings((prev) => prev.map((meeting) => (meeting.id === id ? patcher(meeting) : meeting)));
    };

    const handleRsvp = (id: string, rsvp: AttendeeRsvp) => {
        patchMeeting(id, (meeting) => ({
            ...meeting,
            attendees: meeting.attendees.map((a) =>
                a.user.id === currentUserId ? { ...a, rsvp } : a,
            ),
        }));
    };

    const handleVote = (id: string, slotId: string) => {
        patchMeeting(id, (meeting) => ({
            ...meeting,
            suggested_slots: meeting.suggested_slots.map((slot) => {
                const others = { ...slot, voter_ids: slot.voter_ids.filter((x) => x !== currentUserId) };
                if (slot.id !== slotId) return others;
                const already = slot.voter_ids.includes(currentUserId);
                return already ? others : { ...others, voter_ids: [...others.voter_ids, currentUserId] };
            }),
        }));
    };

    const handleAddSlot = (id: string, draft: { date: string; start_time: string; end_time: string }) => {
        patchMeeting(id, (meeting) => ({
            ...meeting,
            suggested_slots: [
                ...meeting.suggested_slots,
                {
                    id: `slot-${Date.now()}`,
                    date: draft.date,
                    start_time: draft.start_time,
                    end_time: draft.end_time,
                    proposed_by: currentUserId,
                    voter_ids: [],
                } satisfies MeetingTimeSlotInterface,
            ],
        }));
    };

    const handleCloseVoting = (id: string, winningSlotId: string) => {
        patchMeeting(id, (meeting) => {
            const winner = meeting.suggested_slots.find((slot) => slot.id === winningSlotId);
            if (!winner) return meeting;
            return {
                ...meeting,
                status: MeetingStatus.Scheduled,
                date: winner.date,
                start_time: winner.start_time,
                end_time: winner.end_time,
                suggested_slots: [],
                voting_closes_at: null,
            };
        });
    };

    const handleAddComment = (id: string, body: string) => {
        patchMeeting(id, (meeting) => ({
            ...meeting,
            comments: [
                ...meeting.comments,
                {
                    id: `c-${Date.now()}`,
                    author: currentUserMeetingInfo,
                    body,
                    created_at: new Date().toISOString(),
                } satisfies MeetingCommentInterface,
            ],
        }));
    };

    const handleAddAttachment = (id: string, name: string, size: number) => {
        patchMeeting(id, (meeting) => ({
            ...meeting,
            attachments: [
                ...meeting.attachments,
                {
                    id: `a-${Date.now()}`,
                    name,
                    size,
                    uploaded_by: currentUserMeetingInfo,
                    uploaded_at: new Date().toISOString(),
                } satisfies MeetingAttachmentInterface,
            ],
        }));
    };

    const handleRemoveAttachment = (id: string, attachmentId: string) => {
        patchMeeting(id, (meeting) => ({
            ...meeting,
            attachments: meeting.attachments.filter((a) => a.id !== attachmentId),
        }));
    };

    const handleCreate = (payload: RequestMeetingPayloadInterface) => {
        const project = meetingsSeed.projects.find((p) => p.id === payload.project_id);
        const team = meetingsSeed.teams.find((tm) => tm.id === payload.team_id);
        const attendeeUsers = meetingsSeed.users.filter((u) => payload.attendee_ids.includes(u.id));
        const isVoting = Array.isArray(payload.suggested_slots) && payload.suggested_slots.length >= 2;

        const newMeeting: MeetingInterface = {
            id: `mtg-${Date.now()}`,
            title: payload.title,
            description: payload.description,
            agenda: payload.agenda,
            location: payload.location,
            type: payload.type,
            status: isVoting ? MeetingStatus.Voting : MeetingStatus.Scheduled,
            organizer: currentUserMeetingInfo,
            project_id: payload.project_id ?? null,
            project_name: project?.name ?? null,
            team_id: payload.team_id ?? null,
            team_name: team?.name ?? null,
            date: isVoting ? null : payload.date ?? null,
            start_time: isVoting ? null : payload.start_time ?? null,
            end_time: isVoting ? null : payload.end_time ?? null,
            attendees: [
                { user: currentUserMeetingInfo, rsvp: AttendeeRsvp.Accepted },
                ...attendeeUsers
                    .filter((u) => u.id !== currentUserId)
                    .map((u) => ({ user: u, rsvp: AttendeeRsvp.Pending })),
            ],
            suggested_slots: isVoting
                ? (payload.suggested_slots ?? []).map((slot, index) => ({
                    id: `slot-${Date.now()}-${index}`,
                    date: slot.date,
                    start_time: slot.start_time,
                    end_time: slot.end_time,
                    proposed_by: currentUserId,
                    voter_ids: [],
                }))
                : [],
            voting_closes_at: null,
            comments: [],
            attachments: [],
            created_at: new Date().toISOString(),
        };
        setMeetings((prev) => [newMeeting, ...prev]);
    };

    const canReset = search !== "" || statusFilter !== "all" || from !== "" || to !== "";
    const handleReset = () => {
        setSearch("");
        setStatusFilter("all");
        setFrom("");
        setTo("");
    };

    if (activeMeeting) {
        return (
            <MeetingDetail
                meeting={activeMeeting}
                onBack={() => setActiveId(null)}
                onRsvp={handleRsvp}
                onVote={handleVote}
                onAddSlot={handleAddSlot}
                onCloseVoting={handleCloseVoting}
                onAddComment={handleAddComment}
                onAddAttachment={handleAddAttachment}
                onRemoveAttachment={handleRemoveAttachment}
                currentUserId={currentUserId}
                isOrganizer={activeMeeting.organizer.id === currentUserId}
            />
        );
    }

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
                    <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as MeetingStatus | "all")}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t("All Statuses")}</SelectItem>
                            {(Object.keys(MEETING_STATUS_LABEL) as MeetingStatus[]).map((key) => (
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

            {filtered.length === 0 ? (
                <EmptyState
                    icon={Calendar}
                    title={tab === "upcoming" ? t("No upcoming meetings") : t("No past meetings")}
                    description={t("Adjust filters or request a new meeting to get started.")}
                />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((meeting) => {
                        const duration = computeDuration(meeting.start_time, meeting.end_time);
                        const time = meeting.start_time && meeting.end_time ? `${meeting.start_time} – ${meeting.end_time}` : t("TBD");
                        return (
                            <div key={meeting.id} className="rounded-lg border border-border bg-card p-5 flex flex-col">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <div className="min-w-0">
                                        <h3 className="text-base font-semibold text-text-dark truncate">{meeting.title}</h3>
                                        <p className="text-xs text-text-muted truncate">{meeting.organizer.full_name}</p>
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
                                        <InfoLine icon={meeting.type === MeetingType.Remote ? Link2 : MapPin} value={meeting.location} />
                                    )}
                                </div>

                                <div className="mt-auto flex items-center justify-between pt-3 border-t border-border">
                                    <span className="text-[11px] text-text-muted flex items-center gap-1">
                                        <Users className="h-3 w-3" />
                                        {meeting.attendees.length} {t("attendees")}
                                    </span>
                                    <Button size="sm" variant="outline" onClick={() => setActiveId(meeting.id)}>
                                        {t("View Details")}
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <RequestMeetingDialog
                open={createOpen}
                onOpenChange={setCreateOpen}
                attendees={meetingsSeed.users.filter((u) => u.id !== currentUserId).map((u) => ({ id: u.id, full_name: u.full_name }))}
                projects={meetingsSeed.projects}
                teams={meetingsSeed.teams}
                onSubmit={handleCreate}
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
