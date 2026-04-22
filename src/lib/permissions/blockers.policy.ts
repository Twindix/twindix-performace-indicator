// Matrix: Blockers.
// - View: all tiers.
// - Create: everyone except viewer.
// - Edit any: admin+manager.
// - Edit OWN (reported) blocker: tester+member on blockers they reported.
// - Resolve / escalate / link-unlink: admin+manager any; tester+member on own.
// - Delete: admin only.
// Doc uses "own reported" for edit, "own" for resolve/escalate/link. We resolve:
//   - edit-own        → `reporter.id`
//   - resolve/link    → `owner.id` (fallback to reporter.id if owner missing)
import type { BlockerInterface } from "@/interfaces";
import type { Ctx } from "./helpers";
import { inRoles, isViewer } from "./helpers";

const isReporter = (b: BlockerInterface | null | undefined, ctx: Ctx): boolean =>
    !!b?.reporter?.id && b.reporter.id === ctx.userId;

const isOwner = (b: BlockerInterface | null | undefined, ctx: Ctx): boolean =>
    !!b?.owner?.id && b.owner.id === ctx.userId;

export const blockersPolicy = {
    view:         (_: Ctx) => true,
    create:       (ctx: Ctx) => !isViewer(ctx),
    editAny:      (ctx: Ctx) => inRoles(ctx, "admin", "manager"),
    edit:         (ctx: Ctx, b: BlockerInterface) =>
                     inRoles(ctx, "admin", "manager") ||
                     (inRoles(ctx, "tester", "member") && isReporter(b, ctx)),
    resolve:      (ctx: Ctx, b: BlockerInterface) =>
                     inRoles(ctx, "admin", "manager") ||
                     (inRoles(ctx, "tester", "member") && (isOwner(b, ctx) || isReporter(b, ctx))),
    escalate:     (ctx: Ctx, b: BlockerInterface) =>
                     inRoles(ctx, "admin", "manager") ||
                     (inRoles(ctx, "tester", "member") && (isOwner(b, ctx) || isReporter(b, ctx))),
    linkTasks:    (ctx: Ctx, b: BlockerInterface) =>
                     inRoles(ctx, "admin", "manager") ||
                     (inRoles(ctx, "tester", "member") && (isOwner(b, ctx) || isReporter(b, ctx))),
    delete:       (ctx: Ctx) => inRoles(ctx, "admin"),
};
