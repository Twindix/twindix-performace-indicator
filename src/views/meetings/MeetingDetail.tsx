import { useMemo, useRef, useState } from "react";
import { ChevronLeft, Paperclip, Plus, Send, Trash2 } from "lucide-react";

import { Badge, Button, Input, Textarea } from "@/atoms";
import { AttendeeRsvp, MeetingStatus } from "@/enums";
import { t, useAuth } from "@/hooks";
import type { MeetingInterface, MeetingTimeSlotInterface, MeetingUserInterface } from "@/interfaces/meetings";
import { cn } from "@/utils";

import { MEETING_STATUS_LABEL, MEETING_STATUS_VARIANT, MEETING_TYPE_LABEL, RSVP_LABEL, RSVP_TONE } from "./constants";

interface MeetingDetailProps {
    meeting: MeetingInterface;
    onBack: () => void;
    onRsvp: (meetingId: string, rsvp: AttendeeRsvp) => void;
    onVote: (meetingId: string, slotId: string) => void;
    onAddSlot: (meetingId: string, slot: { date: string; start_time: string; end_time: string }) => void;
    onCloseVoting: (meetingId: string, winningSlotId: string) => void;
    onAddComment: (meetingId: string, body: string) => void;
    onAddAttachment: (meetingId: string, name: string, size: number) => void;
    onRemoveAttachment: (meetingId: string, attachmentId: string) => void;
    currentUserId: string;
    isOrganizer: boolean;
}

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

const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const topVotedSlot = (slots: MeetingTimeSlotInterface[]) =>
    [...slots].sort((a, b) => b.voter_ids.length - a.voter_ids.length)[0] ?? null;

export const MeetingDetail = ({
    meeting,
    onBack,
    onRsvp,
    onVote,
    onAddSlot,
    onCloseVoting,
    onAddComment,
    onAddAttachment,
    onRemoveAttachment,
    currentUserId,
    isOrganizer,
}: MeetingDetailProps) => {
    const { user } = useAuth();
    const displayName = user?.full_name ?? "You";

    const [commentDraft, setCommentDraft] = useState("");
    const [slotDraft, setSlotDraft] = useState({ date: "", start_time: "", end_time: "" });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const duration = computeDuration(meeting.start_time, meeting.end_time);
    const myAttendance = meeting.attendees.find((a) => a.user.id === currentUserId);

    const winning = useMemo(() => topVotedSlot(meeting.suggested_slots), [meeting.suggested_slots]);

    const handleSlotAdd = () => {
        if (!slotDraft.date || !slotDraft.start_time || !slotDraft.end_time) return;
        onAddSlot(meeting.id, slotDraft);
        setSlotDraft({ date: "", start_time: "", end_time: "" });
    };

    const handleCloseVoting = () => {
        if (!winning) return;
        onCloseVoting(meeting.id, winning.id);
    };

    const handleCommentSubmit = () => {
        const body = commentDraft.trim();
        if (!body) return;
        onAddComment(meeting.id, body);
        setCommentDraft("");
    };

    const handleFilePick = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        onAddAttachment(meeting.id, file.name, file.size);
        event.target.value = "";
    };

    const isVoting = meeting.status === MeetingStatus.Voting;

    return (
        <div>
            <div className="flex items-start gap-3 mb-4">
                <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5 mt-1">
                    <ChevronLeft className="h-4 w-4" />
                    {t("Back")}
                </Button>
                <div className="flex-1">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <h2 className="text-xl font-bold text-text-dark">{meeting.title}</h2>
                            {meeting.description && (
                                <p className="text-sm text-text-muted mt-1">{meeting.description}</p>
                            )}
                        </div>
                        <Badge variant={MEETING_STATUS_VARIANT[meeting.status]}>
                            {t(MEETING_STATUS_LABEL[meeting.status])}
                        </Badge>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-lg border border-border bg-card p-4 mb-4">
                <Stat label={t("Date")} value={meeting.date ?? "—"} />
                <Stat label={t("Time")} value={meeting.start_time && meeting.end_time ? `${meeting.start_time} – ${meeting.end_time}` : "—"} />
                <Stat label={t("Duration")} value={duration ?? "—"} />
                <Stat label={t("Type")} value={t(MEETING_TYPE_LABEL[meeting.type])} />
            </div>

            {myAttendance && !isVoting && meeting.status === MeetingStatus.Scheduled && (
                <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-4 mb-4">
                    {myAttendance.rsvp === AttendeeRsvp.Pending ? (
                        <p className="text-sm text-text-dark">{t("You haven't responded to this meeting yet.")}</p>
                    ) : (
                        <p className="text-sm text-text-dark">
                            {t("Your response:")} <span className={cn("font-semibold", RSVP_TONE[myAttendance.rsvp])}>{t(RSVP_LABEL[myAttendance.rsvp])}</span>
                        </p>
                    )}
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            onClick={() => onRsvp(meeting.id, AttendeeRsvp.Accepted)}
                            variant={myAttendance.rsvp === AttendeeRsvp.Accepted ? "default" : "outline"}
                        >
                            {t("Accept")}
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => onRsvp(meeting.id, AttendeeRsvp.Declined)}
                            variant={myAttendance.rsvp === AttendeeRsvp.Declined ? "destructive" : "outline"}
                        >
                            {t("Decline")}
                        </Button>
                    </div>
                </div>
            )}

            {isVoting && (
                <div className="rounded-lg border border-border bg-card p-4 mb-4">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h3 className="text-sm font-semibold text-text-dark">{t("Proposed Time Slots")}</h3>
                            <p className="text-[11px] text-text-muted">
                                {isOrganizer
                                    ? t("Attendees are voting. Add more slots or close voting to confirm the winning time.")
                                    : t("Pick the slot that works best for you. You can change your vote anytime.")}
                            </p>
                        </div>
                        {isOrganizer && (
                            <Button size="sm" variant="outline" onClick={handleCloseVoting} disabled={!winning}>
                                {t("Close voting & confirm")}
                            </Button>
                        )}
                    </div>

                    <div className="space-y-2">
                        {meeting.suggested_slots.map((slot) => {
                            const hasVoted = slot.voter_ids.includes(currentUserId);
                            const isTop = winning?.id === slot.id && slot.voter_ids.length > 0;
                            return (
                                <div
                                    key={slot.id}
                                    className={cn(
                                        "flex items-center justify-between gap-3 rounded-lg border px-3 py-2",
                                        isTop ? "border-success bg-success-light/30" : "border-border",
                                    )}
                                >
                                    <div>
                                        <p className="text-sm font-semibold text-text-dark">
                                            {slot.date} · {slot.start_time} – {slot.end_time}
                                        </p>
                                        <p className="text-[11px] text-text-muted">
                                            {slot.voter_ids.length} {slot.voter_ids.length === 1 ? t("vote") : t("votes")}
                                        </p>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant={hasVoted ? "default" : "outline"}
                                        onClick={() => onVote(meeting.id, slot.id)}
                                    >
                                        {hasVoted ? t("Voted") : t("Vote")}
                                    </Button>
                                </div>
                            );
                        })}
                    </div>

                    {isOrganizer && (
                        <div className="mt-4 pt-4 border-t border-border">
                            <p className="text-xs font-semibold text-text-dark mb-2">{t("Add another slot")}</p>
                            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center">
                                <Input
                                    type="date"
                                    value={slotDraft.date}
                                    onChange={(e) => setSlotDraft({ ...slotDraft, date: e.target.value })}
                                />
                                <Input
                                    type="time"
                                    value={slotDraft.start_time}
                                    onChange={(e) => setSlotDraft({ ...slotDraft, start_time: e.target.value })}
                                    className="w-28"
                                />
                                <Input
                                    type="time"
                                    value={slotDraft.end_time}
                                    onChange={(e) => setSlotDraft({ ...slotDraft, end_time: e.target.value })}
                                    className="w-28"
                                />
                                <Button size="sm" className="gap-1" onClick={handleSlotAdd}>
                                    <Plus className="h-3.5 w-3.5" />
                                    {t("Add")}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="rounded-lg border border-border bg-card p-4 mb-4 space-y-3">
                <Labelled label={t("Organizer")} value={meeting.organizer.full_name} />
                {meeting.location && <Labelled label={t("Location / Link")} value={meeting.location} />}
                {meeting.description && <Labelled label={t("Description")} value={meeting.description} />}
                {meeting.agenda && <Labelled label={t("Notes / Agenda")} value={meeting.agenda} />}
                <div className="grid grid-cols-2 gap-4">
                    {meeting.project_id && <Labelled label={t("Project")} value={meeting.project_name ?? meeting.project_id} tone="primary" />}
                    {meeting.team_id && <Labelled label={t("Team")} value={meeting.team_name ?? meeting.team_id} tone="primary" />}
                </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-4 mb-4">
                <h3 className="text-sm font-semibold text-text-dark mb-3">
                    {t("Attendees")} <span className="text-text-muted font-normal">({meeting.attendees.length})</span>
                </h3>
                <div className="space-y-2 divide-y divide-border">
                    {meeting.attendees.map((attendee) => (
                        <AttendeeRow
                            key={attendee.user.id}
                            attendee={attendee.user}
                            rsvp={attendee.rsvp}
                            isSelf={attendee.user.id === currentUserId}
                            selfDisplayName={displayName}
                        />
                    ))}
                </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-text-dark">
                        {t("Attachments")} <span className="text-text-muted font-normal">({meeting.attachments.length})</span>
                    </h3>
                    <Button size="sm" variant="outline" className="gap-1.5" onClick={() => fileInputRef.current?.click()}>
                        <Paperclip className="h-3.5 w-3.5" />
                        {t("Attach")}
                    </Button>
                    <input ref={fileInputRef} type="file" className="hidden" onChange={handleFilePick} />
                </div>
                {meeting.attachments.length === 0 ? (
                    <p className="text-xs text-text-muted">{t("No attachments yet.")}</p>
                ) : (
                    <ul className="space-y-2">
                        {meeting.attachments.map((attachment) => (
                            <li key={attachment.id} className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2">
                                <div className="flex items-center gap-2 min-w-0">
                                    <Paperclip className="h-4 w-4 text-text-muted shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-text-dark truncate">{attachment.name}</p>
                                        <p className="text-[11px] text-text-muted">
                                            {formatSize(attachment.size)} · {attachment.uploaded_by.full_name}
                                        </p>
                                    </div>
                                </div>
                                {attachment.uploaded_by.id === currentUserId && (
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8"
                                        onClick={() => onRemoveAttachment(meeting.id, attachment.id)}
                                    >
                                        <Trash2 className="h-4 w-4 text-error" />
                                    </Button>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="rounded-lg border border-border bg-card p-4">
                <h3 className="text-sm font-semibold text-text-dark mb-3">
                    {t("Comments")} <span className="text-text-muted font-normal">({meeting.comments.length})</span>
                </h3>
                <div className="space-y-3 mb-3">
                    {meeting.comments.length === 0 && (
                        <p className="text-xs text-text-muted">{t("No comments yet. Start the discussion.")}</p>
                    )}
                    {meeting.comments.map((comment) => (
                        <div key={comment.id} className="flex items-start gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-lighter text-primary-medium text-xs font-semibold shrink-0">
                                {comment.author.avatar_initials}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span className="text-sm font-semibold text-text-dark">{comment.author.full_name}</span>
                                    <span className="text-[11px] text-text-muted">{new Date(comment.created_at).toLocaleString()}</span>
                                </div>
                                <p className="text-sm text-text-dark whitespace-pre-wrap">{comment.body}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex items-end gap-2 pt-3 border-t border-border">
                    <Textarea
                        rows={2}
                        placeholder={t("Add a comment...")}
                        value={commentDraft}
                        onChange={(e) => setCommentDraft(e.target.value)}
                        className="flex-1"
                    />
                    <Button size="sm" className="gap-1.5" onClick={handleCommentSubmit} disabled={commentDraft.trim() === ""}>
                        <Send className="h-3.5 w-3.5" />
                        {t("Post")}
                    </Button>
                </div>
            </div>
        </div>
    );
};

const Stat = ({ label, value }: { label: string; value: string }) => (
    <div>
        <p className="text-[11px] uppercase tracking-wide text-text-muted">{label}</p>
        <p className="text-sm font-semibold text-text-dark mt-1">{value}</p>
    </div>
);

const Labelled = ({ label, value, tone }: { label: string; value: string; tone?: "primary" }) => (
    <div>
        <p className="text-[11px] uppercase tracking-wide text-text-muted">{label}</p>
        <p className={cn("text-sm font-semibold mt-1", tone === "primary" ? "text-primary-medium" : "text-text-dark")}>{value}</p>
    </div>
);

interface AttendeeRowProps {
    attendee: MeetingUserInterface;
    rsvp: AttendeeRsvp;
    isSelf: boolean;
    selfDisplayName: string;
}

const AttendeeRow = ({ attendee, rsvp, isSelf, selfDisplayName }: AttendeeRowProps) => (
    <div className="flex items-center justify-between py-2 first:pt-0">
        <div>
            <p className="text-sm font-semibold text-text-dark">{isSelf ? `${selfDisplayName} (${t("You")})` : attendee.full_name}</p>
            {attendee.role_label && <p className="text-[11px] text-text-muted">{attendee.role_label}</p>}
        </div>
        <span className={cn("text-sm font-semibold", RSVP_TONE[rsvp])}>{t(RSVP_LABEL[rsvp])}</span>
    </div>
);

