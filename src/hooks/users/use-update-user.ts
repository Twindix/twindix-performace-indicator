import { useState } from "react";
import { toast } from "sonner";

import { usersConstants } from "@/constants";
import type { UpdateUserPayloadInterface, UserInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { usersService } from "@/services";

export const useUpdateUser = () => {
    const [isLoading, setIsLoading] = useState(false);

    const updateHandler = async (id: string, payload: UpdateUserPayloadInterface): Promise<UserInterface | null> => {
        if (!navigator.onLine) throw new Error(usersConstants.errors.genericError);
        setIsLoading(true);
        try {
            const res = await usersService.updateHandler(id, payload);
            toast.success(usersConstants.messages.updateSuccess);
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, usersConstants.errors.updateFailed));
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return { updateHandler, isLoading };
};
