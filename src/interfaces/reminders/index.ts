import type { PaginatedResponseInterface, PaginationParamsInterface } from "@/interfaces/common";
import type { ReminderStatus } from "@/enums";

export type ReminderUrgency = "today" | "critical" | "warning" | "soon" | "calm" | "expired";

export interface ReminderCreatorInterface {
    id: string;
    full_name: string;
    avatar_initials: string;
}

export interface ReminderInterface {
    id: string;
    project_id?: string | null;
    title: string;
    description: string | null;
    expires_at: string;
    notify_before_days: number[];
    status: ReminderStatus;
    created_by: ReminderCreatorInterface;
    created_at: string;
    updated_at?: string;
}

export interface CreateReminderPayloadInterface {
    title: string;
    description?: string;
    expires_at: string;
    notify_before_days: number[];
    project_id?: string;
}

export interface UpdateReminderPayloadInterface extends Partial<CreateReminderPayloadInterface> {
    status?: ReminderStatus;
}

export interface RemindersListFiltersInterface extends PaginationParamsInterface {
    status?: ReminderStatus;
    urgency?: ReminderUrgency;
    search?: string;
    project_id?: string;
    sort?: "date-asc" | "date-desc" | "created";
}

export type RemindersListResponseInterface = PaginatedResponseInterface<ReminderInterface>;

export interface RemindersStatsInterface {
    total: number;
    active: number;
    expired: number;
    dismissed: number;
    critical: number;
    this_week: number;
}
