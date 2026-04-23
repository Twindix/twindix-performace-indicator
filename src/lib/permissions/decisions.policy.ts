// Matrix: Decisions.
// - View: all tiers.
// - Create: admin + manager + member. Tester CANNOT create (only module where tester < member).
// - Edit any: admin + manager.
// - Edit own: admin + manager + member (on decisions they created).
// - Delete: admin + manager.
// - Set status (approve/reject): admin + manager (per the existing isPM check, PM = manager).
// Owner field on DecisionInterface: `created_by.id`.
import type { DecisionInterface } from "@/interfaces";
import type { Ctx } from "./helpers";
import { inRoles } from "./helpers";

const isCreator = (d: DecisionInterface | null | undefined, ctx: Ctx): boolean =>
    !!d?.created_by?.id && d.created_by.id === ctx.userId;

export const decisionsPolicy = {
    view:       (_: Ctx) => true,
    create:     (ctx: Ctx) => inRoles(ctx, "admin", "manager", "member"),
    editAny:    (ctx: Ctx) => inRoles(ctx, "admin", "manager"),
    edit:       (ctx: Ctx, d: DecisionInterface) =>
                   inRoles(ctx, "admin", "manager") || (inRoles(ctx, "member") && isCreator(d, ctx)),
    delete:     (ctx: Ctx) => inRoles(ctx, "admin", "manager"),
    setStatus:  (ctx: Ctx) => inRoles(ctx, "admin", "manager"),
};
