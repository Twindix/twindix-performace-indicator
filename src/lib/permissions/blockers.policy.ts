// Matrix: Blockers.
// - View: all tiers.
// - Create: everyone except viewer.
// - Edit any: owner + admin + manager.
// - Edit OWN (reported) blocker: tester+member on blockers they reported.
// - Resolve / escalate / link-unlink: owner+admin+manager any; tester+member on own.
// - Delete: owner + admin.
import type { BlockerInterface } from "@/interfaces";
import type { Ctx } from "./helpers";
import { inRoles, isViewer } from "./helpers";

const isReporter = (b: BlockerInterface | null | undefined, ctx: Ctx): boolean =>
    !!b?.reporter?.id && b.reporter.id === ctx.userId;

const isOwnerOf = (b: BlockerInterface | null | undefined, ctx: Ctx): boolean =>
    !!b?.owner?.id && b.owner.id === ctx.userId;

export const blockersPolicy = {
    view:         (_: Ctx) => true,
    create:       (ctx: Ctx) => !isViewer(ctx),
    editAny:      (ctx: Ctx) => inRoles(ctx, "owner", "admin", "manager"),
    edit:         (ctx: Ctx, b: BlockerInterface) =>
                     inRoles(ctx, "owner", "admin", "manager") ||
                     (inRoles(ctx, "tester", "member") && isReporter(b, ctx)),
    resolve:      (ctx: Ctx, b: BlockerInterface) =>
                     inRoles(ctx, "owner", "admin", "manager") ||
                     (inRoles(ctx, "tester", "member") && (isOwnerOf(b, ctx) || isReporter(b, ctx))),
    escalate:     (ctx: Ctx, b: BlockerInterface) =>
                     inRoles(ctx, "owner", "admin", "manager") ||
                     (inRoles(ctx, "tester", "member") && (isOwnerOf(b, ctx) || isReporter(b, ctx))),
    linkTasks:    (ctx: Ctx, b: BlockerInterface) =>
                     inRoles(ctx, "owner", "admin", "manager") ||
                     (inRoles(ctx, "tester", "member") && (isOwnerOf(b, ctx) || isReporter(b, ctx))),
    delete:       (ctx: Ctx) => inRoles(ctx, "owner", "admin"),
};
