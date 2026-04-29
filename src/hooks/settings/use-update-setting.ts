import { useCallback } from "react";

import type { UserSettingsInterface } from "@/interfaces/common";
import type { UseUpdateSettingReturnInterface } from "@/interfaces/settings";
import { buildSettingsPatch } from "@/lib/settings";

import { useAuth } from "../auth";
import { useUpdateMe } from "../auth/use-update-me";
import { useUpdateUser } from "../auth/use-update-user";

export const useUpdateSetting = (): UseUpdateSettingReturnInterface => {
    const { user } = useAuth();
    const { onUpdateUser } = useUpdateUser();
    const { updateHandler } = useUpdateMe();

    const updateSetting = useCallback(async (patch: Partial<UserSettingsInterface>) => {
        if (!user) return;
        const merged = buildSettingsPatch(user.settings, patch);
        const result = await updateHandler({ settings: merged });
        if (result) onUpdateUser(result);
    }, [user, updateHandler, onUpdateUser]);

    return { updateSetting };
};
