import { useState } from "react";
import { toast } from "sonner";

import { usersConstants } from "@/constants";
import type { UpdateProfilePayloadInterface, UserInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { usersService } from "@/services";

export const useUpdateProfile = () => {
    const [isLoading, setIsLoading] = useState(false);

    const updateHandler = async (payload: UpdateProfilePayloadInterface): Promise<UserInterface | null> => {
        if (!navigator.onLine) throw new Error(usersConstants.errors.genericError);
        setIsLoading(true);
        try {
            const res = await usersService.updateMeProfileHandler(payload);
            toast.success(usersConstants.messages.profileUpdateSuccess);
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, usersConstants.errors.profileUpdateFailed));
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return { updateHandler, isLoading };
};
