import { useState } from "react";
import { toast } from "sonner";

import { redFlagsConstants } from "@/constants";
import { getErrorMessage } from "@/lib/error";
import { redFlagsService } from "@/services";

export const useDeleteRedFlag = () => {
    const [isLoading, setIsLoading] = useState(false);

    const deleteHandler = async (id: string): Promise<boolean> => {
        if (!navigator.onLine) throw new Error(redFlagsConstants.errors.genericError);
        setIsLoading(true);
        try {
            await redFlagsService.deleteHandler(id);
            toast.success(redFlagsConstants.messages.deleteSuccess);
            return true;
        } catch (err) {
            toast.error(getErrorMessage(err, redFlagsConstants.errors.deleteFailed));
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return { deleteHandler, isLoading };
};
