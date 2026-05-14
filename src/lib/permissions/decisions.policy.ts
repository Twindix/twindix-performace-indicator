// Matrix: Decisions.
// - View: all tiers.
// - Create: owner + admin + manager + member. Tester CANNOT create (only module where tester < member).
// - Edit any: owner + admin + manager.
// - Edit own: owner + admin + manager + member (on decisions they created).
// - Delete: owner + admin + manager.
// - Set status (approve/reject): owner + admin + manager.
import type { DecisionInterface } from "@/interfaces";
import type { Ctx } from "./helpers";
import { inRoles } from "./helpers";

const isCreator = (d: DecisionInterface | null | undefined, ctx: Ctx): boolean =>
    !!d?.created_by?.id && d.created_by.id === ctx.userId;

export const decisionsPolicy = {
    view:       (_: Ctx) => true,
    create:     (ctx: Ctx) => inRoles(ctx, "owner", "admin", "manager", "member"),
    editAny:    (ctx: Ctx) => inRoles(ctx, "owner", "admin", "manager"),
    edit:       (ctx: Ctx, d: DecisionInterface) =>
                   inRoles(ctx, "owner", "admin", "manager") || (inRoles(ctx, "member") && isCreator(d, ctx)),
    delete:     (ctx: Ctx) => inRoles(ctx, "owner", "admin", "manager"),
    setStatus:  (ctx: Ctx) => inRoles(ctx, "owner", "admin", "manager"),
};
