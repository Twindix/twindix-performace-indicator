import { ReminderStatus } from "@/enums";
import type { ReminderInterface } from "@/interfaces";

const u = (id: string, name: string, initials: string) => ({ id, full_name: name, avatar_initials: initials });

const inDays = (d: number) => {
    const dt = new Date();
    dt.setDate(dt.getDate() + d);
    return dt.toISOString().split("T")[0];
};

export const seedReminders: ReminderInterface[] = [
    {
        id: "rem-001",
        title: "SSL Certificate — api.twindix.com",
        description: "Wildcard certificate from Let's Encrypt covering all *.twindix.com subdomains. Auto-renew should kick in, but verify it landed.",
        expires_at: inDays(3),
        notify_before_days: [7, 2, 1],
        status: ReminderStatus.Active,
        created_by: u("019def78-5e66-72bd-8216-9b1940619517", "Mohamed Elhawary", "ME"),
        created_at: new Date(Date.now() - 30 * 86400_000).toISOString(),
    },
    {
        id: "rem-002",
        title: "Apple Developer Program renewal",
        description: "Annual $99 renewal. Required for App Store distribution.",
        expires_at: inDays(14),
        notify_before_days: [30, 14, 7, 1],
        status: ReminderStatus.Active,
        created_by: u("019def78-601a-72da-8863-fc0a2bf41a28", "Ahmed Heikal", "AH"),
        created_at: new Date(Date.now() - 200 * 86400_000).toISOString(),
    },
    {
        id: "rem-003",
        title: "AWS reserved instance term",
        description: "1-year RI on the API cluster. Decide: renew, switch to Savings Plan, or downsize.",
        expires_at: inDays(45),
        notify_before_days: [30, 14, 7],
        status: ReminderStatus.Active,
        created_by: u("019def78-60f9-7391-a4e6-86b2439dee89", "Ahmed Bashier", "AB"),
        created_at: new Date(Date.now() - 320 * 86400_000).toISOString(),
    },
    {
        id: "rem-004",
        title: "GitHub Enterprise subscription",
        description: "Per-seat invoicing. Reconcile seat count with HR before renewal.",
        expires_at: inDays(78),
        notify_before_days: [30, 14, 7, 2],
        status: ReminderStatus.Active,
        created_by: u("019def78-5e66-72bd-8216-9b1940619517", "Mohamed Elhawary", "ME"),
        created_at: new Date(Date.now() - 287 * 86400_000).toISOString(),
    },
    {
        id: "rem-005",
        title: "Domain registration — twindix.com",
        description: "Primary domain. 5-year registration locked in last cycle, but worth a calendar entry.",
        expires_at: inDays(412),
        notify_before_days: [30, 14],
        status: ReminderStatus.Active,
        created_by: u("019def78-5e66-72bd-8216-9b1940619517", "Mohamed Elhawary", "ME"),
        created_at: new Date(Date.now() - 670 * 86400_000).toISOString(),
    },
    {
        id: "rem-006",
        title: "Figma Org plan renewal",
        description: "Design team license. Verify editor count is correct (we added 2 designers this quarter).",
        expires_at: inDays(-4),
        notify_before_days: [14, 7, 1],
        status: ReminderStatus.Expired,
        created_by: u("019def78-5d69-7321-a86c-8bf2beeaef07", "Karim Sayed", "KS"),
        created_at: new Date(Date.now() - 365 * 86400_000).toISOString(),
    },
];
