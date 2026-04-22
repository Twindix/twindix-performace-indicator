// Matrix: Authentication & Profile.
// - Everyone can login/logout, view /me, edit own settings.
// - Viewer cannot PUT /me name/presence; every other tier can.
import type { Ctx } from "./helpers";
import { isViewer } from "./helpers";

export const authPolicy = {
    view:           (_: Ctx) => true,
    editProfile:    (ctx: Ctx) => !isViewer(ctx), // PUT /me name + presence
    editSettings:   (_: Ctx) => true,             // dark mode, language, all tiers
};
