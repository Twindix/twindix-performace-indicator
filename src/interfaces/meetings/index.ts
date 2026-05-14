import type { AttendeeRsvp, MeetingStatus, MeetingType } from "@/enums";

export interface MeetingUserInterface {
    id: string;
    full_name: string;
    avatar_initials: string;
    role_label?: string;
}

export interface MeetingAttendeeInterface {
    user: MeetingUserInterface;
    rsvp: AttendeeRsvp;
}

export interface MeetingTimeSlotInterface {
    id: string;
    date: string;
    start_time: string;
    end_time: string;
    proposed_by: string;
    voter_ids: string[];
}

export interface MeetingCommentInterface {
    id: string;
    author: MeetingUserInterface;
    body: string;
    created_at: string;
}

export interface MeetingAttachmentInterface {
    id: string;
    name: string;
    size: number;
    uploaded_by: MeetingUserInterface;
    uploaded_at: string;
}

export interface MeetingInterface {
    id: string;
    title: string;
    description?: string;
    agenda?: string;
    location?: string;
    type: MeetingType;
    status: MeetingStatus;
    organizer: MeetingUserInterface;
    project_id?: string | null;
    project_name?: string | null;
    team_id?: string | null;
    team_name?: string | null;
    date?: string | null;
    start_time?: string | null;
    end_time?: string | null;
    attendees: MeetingAttendeeInterface[];
    suggested_slots: MeetingTimeSlotInterface[];
    voting_closes_at?: string | null;
    comments: MeetingCommentInterface[];
    attachments: MeetingAttachmentInterface[];
    created_at: string;
}

export interface MeetingSeedInterface {
    users: MeetingUserInterface[];
    projects: { id: string; name: string }[];
    teams: { id: string; name: string }[];
    meetings: MeetingInterface[];
}

export interface RequestMeetingPayloadInterface {
    title: string;
    description?: string;
    agenda?: string;
    location?: string;
    type: MeetingType;
    project_id?: string | null;
    team_id?: string | null;
    attendee_ids: string[];
    date?: string | null;
    start_time?: string | null;
    end_time?: string | null;
    suggested_slots?: { date: string; start_time: string; end_time: string }[];
}
