// Matrix: Red Flags.
// - View: all tiers.
// - Create / edit own / delete own: everyone except viewer.
// - Edit others / delete others: admin ONLY (manager cannot — asymmetric vs alerts).
// Owner field on RedFlagInterface: `reporter.id`.
import type { RedFlagInterface } from "@/interfaces";
import type { Ctx } from "./helpers";
import { inRoles, isViewer } from "./helpers";

const isReporter = (f: RedFlagInterface | null | undefined, ctx: Ctx): boolean =>
    !!f?.reporter?.id && f.reporter.id === ctx.userId;

export const redFlagsPolicy = {
    view:         (_: Ctx) => true,
    create:       (ctx: Ctx) => !isViewer(ctx),
    edit:         (ctx: Ctx, f: RedFlagInterface) =>
                     inRoles(ctx, "admin") || (!isViewer(ctx) && isReporter(f, ctx)),
    delete:       (ctx: Ctx, f: RedFlagInterface) =>
                     inRoles(ctx, "admin") || (!isViewer(ctx) && isReporter(f, ctx)),
};
