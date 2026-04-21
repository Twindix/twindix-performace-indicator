import { useState } from "react";
import { toast } from "sonner";

import { requirementsConstants } from "@/constants/requirements";
import { getErrorMessage } from "@/lib/error";
import { requirementsService } from "@/services";

export const useDeleteRequirement = () => {
    const [isLoading, setIsLoading] = useState(false);

    const deleteHandler = async (id: string): Promise<boolean> => {
        setIsLoading(true);
        try {
            await requirementsService.deleteHandler(id);
            toast.success(requirementsConstants.messages.deleteSuccess);
            return true;
        } catch (err) {
            toast.error(getErrorMessage(err, requirementsConstants.errors.deleteFailed));
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return { deleteHandler, isLoading };
};