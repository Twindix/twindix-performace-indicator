// Matrix: Teams.
// - View: all tiers.
// - Create / edit / manage members: owner OR admin.
// - Delete: OWNER ONLY (irreversible action).
import type { Ctx } from "./helpers";
import { isAdminOrAbove, isOwner } from "./helpers";

export const teamsPolicy = {
    view:          (_: Ctx) => true,
    create:        (ctx: Ctx) => isAdminOrAbove(ctx),
    edit:          (ctx: Ctx) => isAdminOrAbove(ctx),
    delete:        (ctx: Ctx) => isOwner(ctx),
    manageMembers: (ctx: Ctx) => isAdminOrAbove(ctx),
    manage:        (ctx: Ctx) => isAdminOrAbove(ctx),
};
