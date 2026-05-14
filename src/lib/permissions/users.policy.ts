// Matrix: User Management — V0.85.
//
// Per the V0.85 permissions matrix (Admin vs Owner):
//   Action                                          | Admin | Owner
//   Create user with member/tester/manager/viewer  |  ✓   |  ✓
//   Create user with admin                          |  ✗   |  ✓
//   Create user with owner                          |  ✗   |  ✗   (owner is set once, not assignable)
//   Change user to admin                            |  ✗   |  ✓
//   Modify another admin's role                     |  ✗   |  ✓
//   Change own role                                 |  ✗   |  ✓
//   Delete / deactivate user                        |  ✗   |  ✓   (owner only)
//
// Admin retains full power within their assigned projects (backend-scoped); these
// frontend predicates only gate the visibility of irreversible / cross-project actions.
import type { RoleTier } from "@/constants/permissions";
import { assignableRolesFor } from "@/constants/permissions";

import type { Ctx } from "./helpers";
import { isAdminOrAbove, isOwner } from "./helpers";

export const usersPolicy = {
    view:        (_: Ctx) => true,
    create:      (ctx: Ctx) => isAdminOrAbove(ctx),
    edit:        (ctx: Ctx) => isAdminOrAbove(ctx),
    deactivate:  (ctx: Ctx) => isOwner(ctx),
    delete:      (ctx: Ctx) => isOwner(ctx),

    /** Only the owner can change a user's role_tier. */
    changeRole:  (ctx: Ctx) => isOwner(ctx),

    /** Can the actor create or edit a user with this target role_tier? */
    canAssignRole: (ctx: Ctx, target: RoleTier) =>
        assignableRolesFor(ctx.role).includes(target),
};
