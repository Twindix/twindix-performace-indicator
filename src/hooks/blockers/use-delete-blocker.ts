import { useState } from "react";
import { toast } from "sonner";

import { blockersConstants } from "@/constants";
import { getErrorMessage } from "@/lib/error";
import { blockersService } from "@/services";

export const useDeleteBlocker = () => {
    const [isLoading, setIsLoading] = useState(false);

    const deleteHandler = async (id: string): Promise<boolean> => {
        setIsLoading(true);
        try {
            await blockersService.deleteHandler(id);
            toast.success(blockersConstants.messages.deleteSuccess);
            return true;
        } catch (err) {
            toast.error(getErrorMessage(err, blockersConstants.errors.deleteFailed));
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return { deleteHandler, isLoading };
};
