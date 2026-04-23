import { AttendeeRsvp, MeetingStatus, MeetingType } from "@/enums";

export const MEETING_STATUS_LABEL: Record<MeetingStatus, string> = {
    [MeetingStatus.Scheduled]: "Scheduled",
    [MeetingStatus.Voting]: "Voting",
    [MeetingStatus.Completed]: "Completed",
    [MeetingStatus.Cancelled]: "Cancelled",
};

export const MEETING_STATUS_VARIANT: Record<
    MeetingStatus,
    "success" | "warning" | "secondary" | "error"
> = {
    [MeetingStatus.Scheduled]: "success",
    [MeetingStatus.Voting]: "warning",
    [MeetingStatus.Completed]: "secondary",
    [MeetingStatus.Cancelled]: "error",
};

export const MEETING_TYPE_LABEL: Record<MeetingType, string> = {
    [MeetingType.Remote]: "Remote",
    [MeetingType.InPerson]: "In Person",
    [MeetingType.Hybrid]: "Hybrid",
};

export const RSVP_LABEL: Record<AttendeeRsvp, string> = {
    [AttendeeRsvp.Pending]: "Pending",
    [AttendeeRsvp.Accepted]: "Accepted",
    [AttendeeRsvp.Declined]: "Declined",
};

export const RSVP_TONE: Record<AttendeeRsvp, string> = {
    [AttendeeRsvp.Pending]: "text-warning",
    [AttendeeRsvp.Accepted]: "text-success",
    [AttendeeRsvp.Declined]: "text-error",
};
