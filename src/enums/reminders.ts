export enum ReminderStatus {
    Active = "active",
    Expired = "expired",
    Dismissed = "dismissed",
}

/** Common "notify me before" presets in days. */
export const NOTIFY_PRESETS = [1, 2, 3, 7, 14, 30] as const;
