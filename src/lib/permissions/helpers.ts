import type { RoleTier } from "@/constants/permissions";

export interface Ctx {
    role: RoleTier;
    userId: string;
}

export const inRoles = (ctx: Ctx, ...roles: RoleTier[]): boolean => roles.includes(ctx.role);

export const isViewer = (ctx: Ctx): boolean => ctx.role === "viewer";

export const ownerOf = <T>(
    resource: T | null | undefined,
    getOwnerId: (r: T) => string | null | undefined,
    ctx: Ctx,
): boolean => {
    if (!resource) return false;
    const ownerId = getOwnerId(resource);
    return !!ownerId && ownerId === ctx.userId;
};
