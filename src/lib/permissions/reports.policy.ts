// Matrix: Reports.
// - View: all tiers.
// - Export: everyone except viewer.
import type { Ctx } from "./helpers";
import { isViewer } from "./helpers";

export const reportsPolicy = {
    view:   (_: Ctx) => true,
    export: (ctx: Ctx) => !isViewer(ctx),
};
