import { useMemo } from "react";

import type { RoleTier } from "@/constants/permissions";
import { useAuth } from "@/hooks/auth";
import {
    type Ctx,
    alertsPolicy,
    authPolicy,
    blockersPolicy,
    commentsPolicy,
    decisionsPolicy,
    projectsPolicy,
    redFlagsPolicy,
    sprintsPolicy,
    tasksPolicy,
    teamsPolicy,
    usersPolicy,
} from "@/lib/permissions";

type Predicate = (ctx: Ctx, ...args: unknown[]) => boolean;
type Module = Record<string, Predicate>;

type BoundModule<M> = {
    [K in keyof M]: M[K] extends (ctx: Ctx, ...args: infer A) => boolean
        ? (...args: A) => boolean
        : never;
};

const bindModule = <M extends Module>(mod: M, ctx: Ctx | null): BoundModule<M> => {
    const out = {} as BoundModule<M>;
    for (const key in mod) {
        const fn = mod[key];
        (out as Record<string, (...a: unknown[]) => boolean>)[key] = (...args: unknown[]) =>
            ctx ? fn(ctx, ...args) : false;
    }
    return out;
};

export interface Permissions {
    role: RoleTier | null;
    userId: string | null;
    auth: BoundModule<typeof authPolicy>;
    sprints: BoundModule<typeof sprintsPolicy>;
    projects: BoundModule<typeof projectsPolicy>;
    tasks: BoundModule<typeof tasksPolicy>;
    comments: BoundModule<typeof commentsPolicy>;
    blockers: BoundModule<typeof blockersPolicy>;
    redFlags: BoundModule<typeof redFlagsPolicy>;
    alerts: BoundModule<typeof alertsPolicy>;
    decisions: BoundModule<typeof decisionsPolicy>;
    users: BoundModule<typeof usersPolicy>;
    teams: BoundModule<typeof teamsPolicy>;
}

export const usePermissions = (): Permissions => {
    const { user } = useAuth();

    return useMemo<Permissions>(() => {
        const ctx: Ctx | null = user ? { role: user.role_tier, userId: user.id } : null;
        return {
            role: ctx?.role ?? null,
            userId: ctx?.userId ?? null,
            auth: bindModule(authPolicy as unknown as Module, ctx) as BoundModule<typeof authPolicy>,
            sprints: bindModule(sprintsPolicy as unknown as Module, ctx) as BoundModule<typeof sprintsPolicy>,
            projects: bindModule(projectsPolicy as unknown as Module, ctx) as BoundModule<typeof projectsPolicy>,
            tasks: bindModule(tasksPolicy as unknown as Module, ctx) as BoundModule<typeof tasksPolicy>,
            comments: bindModule(commentsPolicy as unknown as Module, ctx) as BoundModule<typeof commentsPolicy>,
            blockers: bindModule(blockersPolicy as unknown as Module, ctx) as BoundModule<typeof blockersPolicy>,
            redFlags: bindModule(redFlagsPolicy as unknown as Module, ctx) as BoundModule<typeof redFlagsPolicy>,
            alerts: bindModule(alertsPolicy as unknown as Module, ctx) as BoundModule<typeof alertsPolicy>,
            decisions: bindModule(decisionsPolicy as unknown as Module, ctx) as BoundModule<typeof decisionsPolicy>,
            users: bindModule(usersPolicy as unknown as Module, ctx) as BoundModule<typeof usersPolicy>,
            teams: bindModule(teamsPolicy as unknown as Module, ctx) as BoundModule<typeof teamsPolicy>,
        };
    }, [user?.id, user?.role_tier]);
};
