// Matrix: Features (under Ownership).
// - View: all tiers.
// - Create / edit / delete: owner / admin / manager.
import type { Ctx } from "./helpers";
import { isManagerOrAbove } from "./helpers";

export const featuresPolicy = {
    view:   (_: Ctx) => true,
    create: (ctx: Ctx) => isManagerOrAbove(ctx),
    edit:   (ctx: Ctx) => isManagerOrAbove(ctx),
    delete: (ctx: Ctx) => isManagerOrAbove(ctx),
};
