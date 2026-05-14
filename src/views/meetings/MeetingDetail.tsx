import { useRef, useState } from "react";
import { ChevronLeft, Paperclip, Plus, Send, Trash2 } from "lucide-react";

import { Badge, Button, Input, Textarea } from "@/atoms";
import {
    t,
    useAuth,
    useAddMeetingSlot,
    useCreateMeetingComment,
    useDeleteMeetingAttachment,
    useDeleteMeetingComment,
    useFinalizeMeeting,
    useMeetingDetail,
    useRemoveMeetingSlot,
    useUpdateMeetingRsvp,
    useUploadMeetingAttachment,
    useVoteMeetingSlot,
} from "@/hooks";
import type {
    ApiMeetingAttendeeInterface,
    ApiMeetingTimeSlotInterface,
    RsvpStatus,
} from "@/interfaces";
import { cn } from "@/utils";

import { MEETING_STATUS_LABEL, MEETING_STATUS_VARIANT, MEETING_TYPE_LABEL, RSVP_LABEL, RSVP_TONE } from "./constants";

interface MeetingDetailProps {
    meetingId: string;
    onBack: () => void;
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

const topVotedSlot = (slots: ApiMeetingTimeSlotInterface[]) =>
    [...slots].sort((a, b) => b.votes_count - a.votes_count)[0] ?? null;

export const MeetingDetail = ({ meetingId, onBack }: MeetingDetailProps) => {
    const { user } = useAuth();
    const currentUserId = user?.id ?? "";
    const displayName = user?.full_name ?? "You";

    const { meeting, isLoading, refetch, setMeeting } = useMeetingDetail(meetingId);
    const { voteHandler } = useVoteMeetingSlot();
    const { updateRsvpHandler } = useUpdateMeetingRsvp();
    const { finalizeHandler } = useFinalizeMeeting();
    const { addHandler: addSlotHandler } = useAddMeetingSlot();
    const { removeHandler: removeSlotHandler } = useRemoveMeetingSlot();
    const { createHandler: createCommentHandler } = useCreateMeetingComment();
    const { deleteHandler: deleteCommentHandler } = useDeleteMeetingComment();
    const { uploadHandler: uploadAttachmentHandler } = useUploadMeetingAttachment();
    const { deleteHandler: deleteAttachmentHandler } = useDeleteMeetingAttachment();

    const [commentDraft, setCommentDraft] = useState("");
    const [slotDraft, setSlotDraft] = useState({ date: "", start_time: "", end_time: "" });
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (isLoading && !meeting) {
        return (
            <div>
                <div className="flex items-start gap-3 mb-4">
                    <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5 mt-1">
                        <ChevronLeft className="h-4 w-4" />
                        {t("Back")}
                    </Button>
                </div>
                <div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-text-muted">
                    {t("Loading meeting...")}
                </div>
            </div>
        );
    }

    if (!meeting) {
        return (
            <div>
                <div className="flex items-start gap-3 mb-4">
                    <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5 mt-1">
                        <ChevronLeft className="h-4 w-4" />
                        {t("Back")}
                    </Button>
                </div>
                <div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-text-muted">
                    {t("Meeting not found.")}
                </div>
            </div>
        );
    }

    const duration = computeDuration(meeting.start_time, meeting.end_time);
    const myAttendance = meeting.attendees.find((a: ApiMeetingAttendeeInterface) => a.user_id === currentUserId);
    const winning = topVotedSlot(meeting.time_slots);
    const isVoting = meeting.status === "voting";
    const isOrganizer = meeting.organizer.id === currentUserId;

    const handleRsvp = async (rsvp: RsvpStatus) => {
        if (!currentUserId) return;
        const updated = await updateRsvpHandler(meeting.id, currentUserId, rsvp);
        if (updated) setMeeting(updated);
    };

    const handleVote = async (slotId: string) => {
        const updated = await voteHandler(meeting.id, slotId);
        if (updated) setMeeting(updated);
    };

    const handleSlotAdd = async () => {
        if (!slotDraft.date || !slotDraft.start_time || !slotDraft.end_time) return;
        const result = await addSlotHandler(meeting.id, slotDraft);
        if (result) {
            setSlotDraft({ date: "", start_time: "", end_time: "" });
            refetch();
        }
    };

    const handleSlotRemove = async (slotId: string) => {
        const ok = await removeSlotHandler(meeting.id, slotId);
        if (ok) refetch();
    };

    const handleFinalize = async () => {
        const updated = await finalizeHandler(meeting.id);
        if (updated) setMeeting(updated);
    };

    const handleCommentSubmit = async () => {
        const body = commentDraft.trim();
        if (!body) return;
        const created = await createCommentHandler(meeting.id, body);
        if (created) {
            setCommentDraft("");
            refetch();
        }
    };

    const handleCommentDelete = async (commentId: string) => {
        const ok = await deleteCommentHandler(meeting.id, commentId);
        if (ok) refetch();
    };

    const handleFilePick = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) return;
        const uploaded = await uploadAttachmentHandler(meeting.id, file);
        if (uploaded) refetch();
    };

    const handleAttachmentDelete = async (attachmentId: string) => {
        const ok = await deleteAttachmentHandler(meeting.id, attachmentId);
        if (ok) refetch();
    };

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
                <Stat label={t("Type")} value={t(MEETING_TYPE_LABEL[meeting.meeting_type])} />
            </div>

            {myAttendance && !isVoting && meeting.status === "scheduled" && (
                <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-4 mb-4">
                    {myAttendance.rsvp_status === "pending" ? (
                        <p className="text-sm text-text-dark">{t("You haven't responded to this meeting yet.")}</p>
                    ) : (
                        <p className="text-sm text-text-dark">
                            {t("Your response:")} <span className={cn("font-semibold", RSVP_TONE[myAttendance.rsvp_status])}>{t(RSVP_LABEL[myAttendance.rsvp_status])}</span>
                        </p>
                    )}
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            onClick={() => handleRsvp("accepted")}
                            variant={myAttendance.rsvp_status === "accepted" ? "default" : "outline"}
                        >
                            {t("Accept")}
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => handleRsvp("declined")}
                            variant={myAttendance.rsvp_status === "declined" ? "destructive" : "outline"}
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
                            <Button size="sm" variant="outline" onClick={handleFinalize} disabled={!winning}>
                                {t("Close voting & confirm")}
                            </Button>
                        )}
                    </div>

                    <div className="space-y-2">
                        {meeting.time_slots.map((slot) => {
                            const hasVoted = myAttendance?.voted_slot_id === slot.id;
                            const isTop = winning?.id === slot.id && slot.votes_count > 0;
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
                                            {slot.votes_count} {slot.votes_count === 1 ? t("vote") : t("votes")}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="sm"
                                            variant={hasVoted ? "default" : "outline"}
                                            onClick={() => handleVote(slot.id)}
                                        >
                                            {hasVoted ? t("Voted") : t("Vote")}
                                        </Button>
                                        {isOrganizer && (
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8"
                                                onClick={() => handleSlotRemove(slot.id)}
                                            >
                                                <Trash2 className="h-4 w-4 text-error" />
                                            </Button>
                                        )}
                                    </div>
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
                <Labelled label={t("Organizer")} value={meeting.organizer.name} />
                {meeting.location && <Labelled label={t("Location / Link")} value={meeting.location} />}
                {meeting.description && <Labelled label={t("Description")} value={meeting.description} />}
                {meeting.notes && <Labelled label={t("Notes / Agenda")} value={meeting.notes} />}
                <div className="grid grid-cols-2 gap-4">
                    {meeting.project && <Labelled label={t("Project")} value={meeting.project.name} tone="primary" />}
                    {meeting.team && <Labelled label={t("Team")} value={meeting.team.name} tone="primary" />}
                </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-4 mb-4">
                <h3 className="text-sm font-semibold text-text-dark mb-3">
                    {t("Attendees")} <span className="text-text-muted font-normal">({meeting.attendees.length})</span>
                </h3>
                <div className="space-y-2 divide-y divide-border">
                    {meeting.attendees.map((attendee) => (
                        <AttendeeRow
                            key={attendee.user_id}
                            attendee={attendee}
                            isSelf={attendee.user_id === currentUserId}
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
                                        <p className="text-sm font-medium text-text-dark truncate">{attachment.file_name}</p>
                                        <p className="text-[11px] text-text-muted">
                                            {formatSize(attachment.file_size)} · {attachment.uploaded_by.name}
                                        </p>
                                    </div>
                                </div>
                                {(attachment.uploaded_by.id === currentUserId || isOrganizer) && (
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8"
                                        onClick={() => handleAttachmentDelete(attachment.id)}
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
                                {comment.avatar_initials ?? comment.user_name.split(/\s+/).filter(Boolean).map((p) => p[0]).slice(0, 2).join("").toUpperCase()}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span className="text-sm font-semibold text-text-dark">{comment.user_name}</span>
                                    <span className="text-[11px] text-text-muted">{new Date(comment.created_at).toLocaleString()}</span>
                                    {(comment.user_id === currentUserId || isOrganizer) && (
                                        <button
                                            type="button"
                                            onClick={() => handleCommentDelete(comment.id)}
                                            className="ml-auto text-error hover:opacity-80 cursor-pointer"
                                            aria-label={t("Delete comment")}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    )}
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
    attendee: ApiMeetingAttendeeInterface;
    isSelf: boolean;
    selfDisplayName: string;
}

const AttendeeRow = ({ attendee, isSelf, selfDisplayName }: AttendeeRowProps) => (
    <div className="flex items-center justify-between py-2 first:pt-0">
        <div>
            <p className="text-sm font-semibold text-text-dark">{isSelf ? `${selfDisplayName} (${t("You")})` : attendee.name}</p>
            {attendee.role && <p className="text-[11px] text-text-muted">{attendee.role}</p>}
        </div>
        <span className={cn("text-sm font-semibold", RSVP_TONE[attendee.rsvp_status])}>{t(RSVP_LABEL[attendee.rsvp_status])}</span>
    </div>
);
