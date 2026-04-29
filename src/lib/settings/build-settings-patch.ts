import type { UserSettingsInterface } from "@/interfaces/common";

export const buildSettingsPatch = (
    current: UserSettingsInterface | null | undefined,
    patch: Partial<UserSettingsInterface>,
): UserSettingsInterface => ({
    ...(current ?? {} as UserSettingsInterface),
    ...patch,
});
