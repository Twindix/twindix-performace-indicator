// Matrix: Reminders.
// - View: all tiers.
// - Create / update: owner / admin / manager.
// - Dismiss / reactivate: anyone except viewer.
// - Delete: owner / admin, or manager if creator.
import type { Ctx } from "./helpers";
import { isAdminOrAbove, isManagerOrAbove, isViewer, ownerOf } from "./helpers";

export const remindersPolicy = {
    view:       (_: Ctx) => true,
    create:     (ctx: Ctx) => isManagerOrAbove(ctx),
    edit:       (ctx: Ctx) => isManagerOrAbove(ctx),
    dismiss:    (ctx: Ctx) => !isViewer(ctx),
    reactivate: (ctx: Ctx) => !isViewer(ctx),
    delete:     (ctx: Ctx, reminder?: { created_by?: { id?: string } | null }) =>
        isAdminOrAbove(ctx) ||
        (isManagerOrAbove(ctx) && ownerOf(reminder, (r) => r?.created_by?.id ?? null, ctx)),
};
