// Matrix: Handoffs.
// - View overview/criteria: all tiers (except viewer follows the role).
// - Manage criteria (create/update/delete): owner / admin / manager.
// - Toggle a criteria check: owner / admin / manager / tester / member (anyone except viewer).
import type { Ctx } from "./helpers";
import { isManagerOrAbove, isViewer } from "./helpers";

export const handoffsPolicy = {
    view:           (_: Ctx) => true,
    manageCriteria: (ctx: Ctx) => isManagerOrAbove(ctx),
    toggleCheck:    (ctx: Ctx) => !isViewer(ctx),
};
