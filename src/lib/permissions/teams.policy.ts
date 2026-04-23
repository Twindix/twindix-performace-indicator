// Matrix: Teams.
// - View: all tiers.
// - Create / edit / delete / add-remove members: admin ONLY.
import type { Ctx } from "./helpers";
import { inRoles } from "./helpers";

export const teamsPolicy = {
    view:          (_: Ctx) => true,
    create:        (ctx: Ctx) => inRoles(ctx, "admin"),
    edit:          (ctx: Ctx) => inRoles(ctx, "admin"),
    delete:        (ctx: Ctx) => inRoles(ctx, "admin"),
    manageMembers: (ctx: Ctx) => inRoles(ctx, "admin"),
    manage:        (ctx: Ctx) => inRoles(ctx, "admin"),
};
