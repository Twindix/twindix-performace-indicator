import { useState } from "react";
import { toast } from "sonner";

import { usersConstants } from "@/constants";
import type { CreateUserPayloadInterface, UserInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { usersService } from "@/services";

export const useCreateUser = () => {
    const [isLoading, setIsLoading] = useState(false);

    const createHandler = async (payload: CreateUserPayloadInterface): Promise<UserInterface | null> => {
        if (!navigator.onLine) throw new Error(usersConstants.errors.genericError);
        setIsLoading(true);
        try {
            const res = await usersService.createHandler(payload);
            toast.success(usersConstants.messages.createSuccess);
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, usersConstants.errors.createFailed));
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return { createHandler, isLoading };
};
