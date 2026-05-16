// Matrix: Deploys.
// - View / download: all tiers (except viewer follows the role).
// - Upload: anyone except viewer.
// - Change status: owner / admin / manager.
// - Delete: owner / admin only.
import type { Ctx } from "./helpers";
import { isAdminOrAbove, isManagerOrAbove, isViewer } from "./helpers";

export const deploysPolicy = {
    view:         (_: Ctx) => true,
    download:     (ctx: Ctx) => !isViewer(ctx),
    upload:       (ctx: Ctx) => !isViewer(ctx),
    updateStatus: (ctx: Ctx) => isManagerOrAbove(ctx),
    delete:       (ctx: Ctx) => isAdminOrAbove(ctx),
};
