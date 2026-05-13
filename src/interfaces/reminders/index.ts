import type { ReminderStatus } from "@/enums";

export interface ReminderCreatorInterface {
    id: string;
    full_name: string;
    avatar_initials: string;
}

export interface ReminderInterface {
    id: string;
    title: string;
    description: string | null;
    expires_at: string; // ISO date (yyyy-mm-dd or full ISO)
    /** Days *before* expiration to fire a notification. Multiple allowed. */
    notify_before_days: number[];
    status: ReminderStatus;
    created_by: ReminderCreatorInterface;
    created_at: string;
}

export interface CreateReminderPayloadInterface {
    title: string;
    description?: string;
    expires_at: string;
    notify_before_days: number[];
}

export interface UpdateReminderPayloadInterface extends Partial<CreateReminderPayloadInterface> {
    status?: ReminderStatus;
}
