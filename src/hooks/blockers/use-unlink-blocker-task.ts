import { useState } from "react";
import { toast } from "sonner";

import { blockersConstants } from "@/constants";
import { getErrorMessage } from "@/lib/error";
import { blockersService } from "@/services";

export const useUnlinkBlockerTask = () => {
    const [isLoading, setIsLoading] = useState(false);

    const unlinkHandler = async (id: string, taskId: string): Promise<boolean> => {
        if (!navigator.onLine) throw new Error(blockersConstants.errors.genericError);
        setIsLoading(true);
        try {
            await blockersService.unlinkTaskHandler(id, taskId);
            toast.success(blockersConstants.messages.unlinkTaskSuccess);
            return true;
        } catch (err) {
            toast.error(getErrorMessage(err, blockersConstants.errors.unlinkTaskFailed));
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return { unlinkHandler, isLoading };
};
