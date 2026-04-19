import { useState } from "react";
import { toast } from "sonner";

import { usersConstants } from "@/constants";
import { getErrorMessage } from "@/lib/error";
import { usersService } from "@/services";

export const useDeleteUser = () => {
    const [isLoading, setIsLoading] = useState(false);

    const deleteHandler = async (id: string): Promise<boolean> => {
        if (!navigator.onLine) throw new Error(usersConstants.errors.genericError);
        setIsLoading(true);
        try {
            await usersService.deleteHandler(id);
            toast.success(usersConstants.messages.deleteSuccess);
            return true;
        } catch (err) {
            toast.error(getErrorMessage(err, usersConstants.errors.deleteFailed));
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return { deleteHandler, isLoading };
};
