// Matrix: User Management.
// - View list + profile analytics: all tiers.
// - Create / edit / deactivate: admin ONLY.
// - Create team: admin ONLY (also exposed on teamsPolicy).
import type { Ctx } from "./helpers";
import { inRoles } from "./helpers";

export const usersPolicy = {
    view:       (_: Ctx) => true,
    create:     (ctx: Ctx) => inRoles(ctx, "admin"),
    edit:       (ctx: Ctx) => inRoles(ctx, "admin"),
    deactivate: (ctx: Ctx) => inRoles(ctx, "admin"),
    delete:     (ctx: Ctx) => inRoles(ctx, "admin"),
};
