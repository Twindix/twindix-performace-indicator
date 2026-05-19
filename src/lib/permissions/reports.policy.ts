// Matrix: Reports — V1.1.
// - View / Export: Owner, Admin, Manager only. Tester, Member, Viewer get 403.
import type { Ctx } from "./helpers";
import { isManagerOrAbove } from "./helpers";

export const reportsPolicy = {
    view:        (ctx: Ctx) => isManagerOrAbove(ctx),
    export:      (ctx: Ctx) => isManagerOrAbove(ctx),
    viewAnalytics: (ctx: Ctx) => isManagerOrAbove(ctx),
    downloadCSV: (ctx: Ctx) => isManagerOrAbove(ctx),
};
