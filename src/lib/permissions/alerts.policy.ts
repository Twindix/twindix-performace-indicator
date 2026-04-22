// Matrix: Alerts.
// - View: all tiers.
// - Create: admin + manager.
// - Edit own / delete own: admin + manager on their own alerts.
// - Edit others: admin ONLY (manager cannot).
// - Acknowledge: ALL tiers (viewer's only write action).
// - Mark done: admin + manager.
// Owner field on AlertInterface: `creator.id` (creator is nullable).
import type { AlertInterface } from "@/interfaces";
import type { Ctx } from "./helpers";
import { inRoles } from "./helpers";

const isCreator = (a: AlertInterface | null | undefined, ctx: Ctx): boolean =>
    !!a?.creator?.id && a.creator.id === ctx.userId;

export const alertsPolicy = {
    view:         (_: Ctx) => true,
    create:       (ctx: Ctx) => inRoles(ctx, "admin", "manager"),
    edit:         (ctx: Ctx, a: AlertInterface) =>
                    inRoles(ctx, "admin") || (inRoles(ctx, "manager") && isCreator(a, ctx)),
    delete:       (ctx: Ctx, a: AlertInterface) =>
                    inRoles(ctx, "admin") || (inRoles(ctx, "manager") && isCreator(a, ctx)),
    acknowledge:  (_: Ctx) => true,
    markDone:     (ctx: Ctx) => inRoles(ctx, "admin", "manager"),
};
