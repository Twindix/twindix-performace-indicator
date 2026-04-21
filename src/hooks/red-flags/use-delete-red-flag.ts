import { useCallback, useState } from "react";
import { toast } from "sonner";

import { redFlagsConstants } from "@/constants";
import { getErrorMessage } from "@/lib/error";
import { redFlagsService } from "@/services";

export const useDeleteRedFlag = () => {
    const [isLoading, setIsLoading] = useState(false);

    const deleteHandler = useCallback(async (id: string): Promise<boolean> => {
        setIsLoading(true);
        try {
            await redFlagsService.deleteHandler(id);
            toast.success(redFlagsConstants.messages.deleteSuccess);
            return true;
        } catch (err) {
            console.error(err);
            toast.error(getErrorMessage(err, redFlagsConstants.errors.deleteFailed));
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { deleteHandler, isLoading };
};
