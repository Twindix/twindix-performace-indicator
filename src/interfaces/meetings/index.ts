import type { PaginatedResponseInterface, PaginationParamsInterface } from "@/interfaces/common";
import type { AttendeeRsvp, MeetingStatus, MeetingType } from "@/enums";

// ===== LEGACY seed types (kept for existing view code compatibility) =====

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

// ===== NEW V0.9 API types =====

export type MeetingApiStatus = "voting" | "scheduled" | "completed" | "cancelled";
export type MeetingTypeApi = "remote" | "in_person" | "hybrid";
export type RsvpStatus = "pending" | "accepted" | "declined";

export interface MeetingProjectRefInterface { id: string; name: string; }
export interface MeetingTeamRefInterface { id: string; name: string; }

export interface MeetingOrganizerInterface {
    id: string;
    name: string;
    avatar_initials?: string | null;
}

export interface ApiMeetingTimeSlotInterface {
    id: string;
    date: string;
    start_time: string;
    end_time: string;
    votes_count: number;
}

export interface ApiMeetingAttendeeInterface {
    user_id: string;
    name: string;
    role?: string | null;
    avatar_initials?: string | null;
    rsvp_status: RsvpStatus;
    voted_slot_id?: string | null;
}

export interface ApiMeetingCommentInterface {
    id: string;
    user_id: string;
    user_name: string;
    avatar_initials?: string | null;
    body: string;
    created_at: string;
    updated_at: string;
}

export interface ApiMeetingAttachmentInterface {
    id: string;
    file_name: string;
    file_path: string;
    file_size: number;
    uploaded_by: { id: string; name: string };
    created_at: string;
}

export interface MeetingListItemInterface {
    id: string;
    title: string;
    description?: string | null;
    status: MeetingApiStatus;
    meeting_type: MeetingTypeApi;
    location?: string | null;
    date?: string | null;
    start_time?: string | null;
    end_time?: string | null;
    project?: MeetingProjectRefInterface | null;
    team?: MeetingTeamRefInterface | null;
    organizer: MeetingOrganizerInterface;
    attendees_count?: number;
    created_at: string;
}

export interface MeetingDetailInterface extends MeetingListItemInterface {
    notes?: string | null;
    time_slots: ApiMeetingTimeSlotInterface[];
    attendees: ApiMeetingAttendeeInterface[];
    comments: ApiMeetingCommentInterface[];
    attachments: ApiMeetingAttachmentInterface[];
    updated_at: string;
}

export interface MeetingsListFiltersInterface extends PaginationParamsInterface {
    status?: MeetingApiStatus;
    from?: string;
    to?: string;
    search?: string;
}

export type MeetingsListResponseInterface = PaginatedResponseInterface<MeetingListItemInterface>;

export interface CreateMeetingTimeSlotPayloadInterface {
    date: string;
    start_time: string;
    end_time: string;
}

export interface CreateMeetingPayloadInterface {
    title: string;
    description?: string;
    notes?: string;
    meeting_type: MeetingTypeApi;
    location?: string;
    project_id?: string;
    team_id?: string;
    attendee_ids: string[];
    time_slots: CreateMeetingTimeSlotPayloadInterface[];
}

export interface UpdateMeetingPayloadInterface {
    title?: string;
    description?: string;
    notes?: string;
    meeting_type?: MeetingTypeApi;
    location?: string;
    project_id?: string | null;
    team_id?: string | null;
}

export interface UpdateRsvpPayloadInterface {
    rsvp_status: RsvpStatus;
}

export interface CreateMeetingCommentPayloadInterface {
    body: string;
}
