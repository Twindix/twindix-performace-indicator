// Matrix: Alerts.
// - View: all tiers.
// - Create: owner + admin + manager.
// - Edit own / delete own: owner + admin + manager on their own alerts.
// - Edit others: owner + admin (manager cannot).
// - Acknowledge: only users targeted by the alert (mentioned on it, or target=all).
// - Mark done: owner + admin + manager.
// - Go to task: owner + admin + manager.
import type { AlertInterface } from "@/interfaces";
import type { Ctx } from "./helpers";
import { inRoles } from "./helpers";

const isCreator = (a: AlertInterface | null | undefined, ctx: Ctx): boolean =>
    !!a?.creator?.id && a.creator.id === ctx.userId;

const isMentioned = (a: AlertInterface, ctx: Ctx): boolean =>
    a.mentioned_users.some((u) => u.id === ctx.userId);

export const alertsPolicy = {
    view:         (_: Ctx) => true,
    create:       (ctx: Ctx) => inRoles(ctx, "owner", "admin", "manager"),
    edit:         (ctx: Ctx, a: AlertInterface) =>
                    inRoles(ctx, "owner", "admin") || (inRoles(ctx, "manager") && isCreator(a, ctx)),
    delete:       (ctx: Ctx, a: AlertInterface) =>
                    inRoles(ctx, "owner", "admin") || (inRoles(ctx, "manager") && isCreator(a, ctx)),
    acknowledge:  (ctx: Ctx, a: AlertInterface) => a.target === "all" || isMentioned(a, ctx),
    markDone:     (ctx: Ctx) => inRoles(ctx, "owner", "admin", "manager"),
    goToTask:     (ctx: Ctx) => inRoles(ctx, "owner", "admin", "manager"),
};
