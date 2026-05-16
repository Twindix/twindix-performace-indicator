import type { RoleTier } from "@/constants/permissions";

export interface Ctx {
    role: RoleTier;
    userId: string;
}

export const inRoles = (ctx: Ctx, ...roles: RoleTier[]): boolean => roles.includes(ctx.role);

export const isViewer = (ctx: Ctx): boolean => ctx.role === "viewer";

/** Company owner — unrestricted. Only role that bypasses project scoping. */
export const isOwner = (ctx: Ctx): boolean => ctx.role === "owner";

/** Admin proper (NOT owner). Use this when you specifically need an admin-but-not-owner check. */
export const isAdmin = (ctx: Ctx): boolean => ctx.role === "admin";

/** Owner OR admin. Used for everything the old `inRoles(ctx, "admin")` was used for. */
export const isAdminOrAbove = (ctx: Ctx): boolean => ctx.role === "owner" || ctx.role === "admin";

/** Owner OR admin OR manager. */
export const isManagerOrAbove = (ctx: Ctx): boolean =>
    ctx.role === "owner" || ctx.role === "admin" || ctx.role === "manager";

export const ownerOf = <T>(
    resource: T | null | undefined,
    getOwnerId: (r: T) => string | null | undefined,
    ctx: Ctx,
): boolean => {
    if (!resource) return false;
    const ownerId = getOwnerId(resource);
    return !!ownerId && ownerId === ctx.userId;
};
