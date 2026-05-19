// Matrix: Sprint Management.
// Admin/Manager: create/edit/activate/delete (within their assigned projects).
// Owner: same as admin (unrestricted across projects).
import type { Ctx } from "./helpers";
import { inRoles } from "./helpers";

export const sprintsPolicy = {
    view:          (_: Ctx) => true,
    create:        (ctx: Ctx) => inRoles(ctx, "owner", "admin", "manager"),
    edit:          (ctx: Ctx) => inRoles(ctx, "owner", "admin", "manager"),
    activate:      (ctx: Ctx) => inRoles(ctx, "owner", "admin", "manager"),
    delete:        (ctx: Ctx) => inRoles(ctx, "owner", "admin", "manager"),
    viewAnalytics: (ctx: Ctx) => inRoles(ctx, "owner", "admin", "manager"),
};
