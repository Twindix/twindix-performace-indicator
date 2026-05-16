// Matrix: Task Comments + Comments Log (Sprint-Wide).
// - View: all tiers.
// - Add / edit own / delete own / mark responded: everyone except viewer.
// - Edit others: DENIED for every tier (including admin/owner).
// - Delete others: owner + admin.
import type { CommentInterface } from "@/interfaces";
import type { TaskCommentInterface } from "@/interfaces/tasks";
import type { Ctx } from "./helpers";
import { inRoles, isViewer } from "./helpers";

type AnyComment = Pick<CommentInterface | TaskCommentInterface, "author">;

const isAuthor = (comment: AnyComment | null | undefined, ctx: Ctx): boolean =>
    !!comment?.author?.id && comment.author.id === ctx.userId;

export const commentsPolicy = {
    view:          (_: Ctx) => true,
    add:           (ctx: Ctx) => !isViewer(ctx),
    edit:          (ctx: Ctx, comment: AnyComment) => !isViewer(ctx) && isAuthor(comment, ctx),
    deleteOwn:     (ctx: Ctx, comment: AnyComment) => !isViewer(ctx) && isAuthor(comment, ctx),
    deleteOthers:  (ctx: Ctx) => inRoles(ctx, "owner", "admin"),
    delete:        (ctx: Ctx, comment: AnyComment) =>
                      inRoles(ctx, "owner", "admin") || (!isViewer(ctx) && isAuthor(comment, ctx)),
    respond:       (ctx: Ctx) => !isViewer(ctx),
};
