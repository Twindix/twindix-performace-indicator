// Matrix: Sprint Management.
// Admin/Manager: create/edit/activate. Everyone views.
import type { Ctx } from "./helpers";
import { inRoles } from "./helpers";

export const sprintsPolicy = {
    view:      (_: Ctx) => true,
    create:    (ctx: Ctx) => inRoles(ctx, "admin", "manager"),
    edit:      (ctx: Ctx) => inRoles(ctx, "admin", "manager"),
    activate:  (ctx: Ctx) => inRoles(ctx, "admin", "manager"),
    delete:    (ctx: Ctx) => inRoles(ctx, "admin", "manager"),
};
