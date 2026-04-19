import { useState } from "react";
import { toast } from "sonner";

import { sprintsConstants } from "@/constants";
import { getErrorMessage } from "@/lib/error";
import { sprintsService } from "@/services";

export const useDeleteSprint = () => {
    const [isLoading, setIsLoading] = useState(false);

    const deleteHandler = async (id: string): Promise<boolean> => {
        if (!navigator.onLine) throw new Error(sprintsConstants.errors.genericError);
        setIsLoading(true);
        try {
            await sprintsService.deleteHandler(id);
            toast.success(sprintsConstants.messages.deleteSuccess);
            return true;
        } catch (err) {
            toast.error(getErrorMessage(err, sprintsConstants.errors.deleteFailed));
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return { deleteHandler, isLoading };
};
