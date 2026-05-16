// Matrix: Projects — V0.85.
//   - View: everyone (backend scopes the list).
//   - Create: owner OR admin (admin within their org; backend may still scope).
//   - Edit: owner OR admin (admin only within assigned projects — backend-enforced).
//   - Delete: OWNER ONLY (per the V0.85 capability matrix).
//   - Assign admin to project: OWNER ONLY (new in V0.85).
import type { Ctx } from "./helpers";
import { isAdminOrAbove, isOwner } from "./helpers";

export const projectsPolicy = {
    view:         (_: Ctx) => true,
    create:       (ctx: Ctx) => isAdminOrAbove(ctx),
    edit:         (ctx: Ctx) => isAdminOrAbove(ctx),
    delete:       (ctx: Ctx) => isOwner(ctx),
    assignAdmin:  (ctx: Ctx) => isOwner(ctx),
};
