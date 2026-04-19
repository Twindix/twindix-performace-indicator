import { useState } from "react";
import { toast } from "sonner";

import { usersConstants } from "@/constants";
import type { UserSettingsInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { usersService } from "@/services";

export const useUserSettings = () => {
    const [isLoading, setIsLoading] = useState(false);

    const getHandler = async (): Promise<UserSettingsInterface | null> => {
        if (!navigator.onLine) throw new Error(usersConstants.errors.genericError);
        setIsLoading(true);
        try {
            const res = await usersService.getMeSettingsHandler();
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, usersConstants.errors.settingsFetchFailed));
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const updateHandler = async (payload: UserSettingsInterface): Promise<UserSettingsInterface | null> => {
        if (!navigator.onLine) throw new Error(usersConstants.errors.genericError);
        setIsLoading(true);
        try {
            const res = await usersService.updateMeSettingsHandler(payload);
            toast.success(usersConstants.messages.settingsUpdateSuccess);
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, usersConstants.errors.settingsUpdateFailed));
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return { getHandler, updateHandler, isLoading };
};
