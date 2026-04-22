// Matrix: Task Management.
// - View: all tiers.
// - Create: everyone except viewer.
// - Edit / move / requirements / attachments / log time: admin+manager any; tester+member on own (assigned) task; viewer never.
// - Delete: admin only.
// Owner field on TaskInterface: `assignee.id`.
import type { TaskInterface } from "@/interfaces";
import type { Ctx } from "./helpers";
import { inRoles, isViewer } from "./helpers";

const isAssignee = (task: TaskInterface | null | undefined, ctx: Ctx): boolean =>
    !!task?.assignee?.id && task.assignee.id === ctx.userId;

const managerOrOwnerTester = (ctx: Ctx, task: TaskInterface | null | undefined): boolean =>
    inRoles(ctx, "admin", "manager") || (inRoles(ctx, "tester", "member") && isAssignee(task, ctx));

export const tasksPolicy = {
    view:              (_: Ctx) => true,
    create:            (ctx: Ctx) => !isViewer(ctx),
    editAny:           (ctx: Ctx) => inRoles(ctx, "admin", "manager"),
    edit:              (ctx: Ctx, task: TaskInterface) => managerOrOwnerTester(ctx, task),
    delete:            (ctx: Ctx) => inRoles(ctx, "admin"),
    movePhase:         (ctx: Ctx, task: TaskInterface) => managerOrOwnerTester(ctx, task),
    finishPhase:       (ctx: Ctx, task: TaskInterface) => managerOrOwnerTester(ctx, task),
    toggleRequirement: (ctx: Ctx, task: TaskInterface) => managerOrOwnerTester(ctx, task),
    manageAttachment:  (ctx: Ctx, task: TaskInterface) => managerOrOwnerTester(ctx, task),
    logTime:           (ctx: Ctx, task: TaskInterface) => managerOrOwnerTester(ctx, task),
};
