// Matrix: Alerts.
// - View: all tiers.
// - Create: admin + manager.
// - Edit own / delete own: admin + manager on their own alerts.
// - Edit others: admin ONLY (manager cannot).
// - Acknowledge: only users targeted by the alert (mentioned on it, or target=all).
// - Mark done: admin + manager.
// - Go to task: admin + manager.
// Owner field on AlertInterface: `creator.id` (creator is nullable).
import type { AlertInterface } from "@/interfaces";
import type { Ctx } from "./helpers";
import { inRoles } from "./helpers";

const isCreator = (a: AlertInterface | null | undefined, ctx: Ctx): boolean =>
    !!a?.creator?.id && a.creator.id === ctx.userId;

const isMentioned = (a: AlertInterface, ctx: Ctx): boolean =>
    a.mentioned_users.some((u) => u.id === ctx.userId);

export const alertsPolicy = {
    view:         (_: Ctx) => true,
    create:       (ctx: Ctx) => inRoles(ctx, "admin", "manager"),
    edit:         (ctx: Ctx, a: AlertInterface) =>
                    inRoles(ctx, "admin") || (inRoles(ctx, "manager") && isCreator(a, ctx)),
    delete:       (ctx: Ctx, a: AlertInterface) =>
                    inRoles(ctx, "admin") || (inRoles(ctx, "manager") && isCreator(a, ctx)),
    acknowledge:  (ctx: Ctx, a: AlertInterface) => a.target === "all" || isMentioned(a, ctx),
    markDone:     (ctx: Ctx) => inRoles(ctx, "admin", "manager"),
    goToTask:     (ctx: Ctx) => inRoles(ctx, "admin", "manager"),
};
