import { useCallback, useState } from "react";
import { toast } from "sonner";

import { sprintsConstants } from "@/constants";
import { getErrorMessage } from "@/lib/error";
import { sprintsService } from "@/services";

export const useDeleteSprint = () => {
    const [isLoading, setIsLoading] = useState(false);

    const deleteHandler = useCallback(async (id: string): Promise<boolean> => {
        setIsLoading(true);
        try {
            await sprintsService.deleteHandler(id);
            toast.success(sprintsConstants.messages.deleteSuccess);
            return true;
        } catch (err) {
            console.error(err);
            toast.error(getErrorMessage(err, sprintsConstants.errors.deleteFailed));
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { deleteHandler, isLoading };
};
