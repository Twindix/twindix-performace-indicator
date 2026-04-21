import { useState } from "react";
import { toast } from "sonner";

import { blockersConstants } from "@/constants";
import type { BlockerInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { blockersService } from "@/services";

export const useLinkBlockerTasks = () => {
    const [isLoading, setIsLoading] = useState(false);

    const linkHandler = async (id: string, taskIds: string[]): Promise<BlockerInterface | null> => {
        if (!navigator.onLine) throw new Error(blockersConstants.errors.genericError);
        setIsLoading(true);
        try {
            const res = await blockersService.linkTasksHandler(id, taskIds);
            toast.success(blockersConstants.messages.linkTasksSuccess);
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, blockersConstants.errors.linkTasksFailed));
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return { linkHandler, isLoading };
};
