import { useState } from "react";

import { deploysConstants } from "@/constants";
import { runAction } from "@/lib/handle-action";
import { deploysService } from "@/services";

export const useDeleteDeploy = () => {
    const [isLoading, setIsLoading] = useState(false);

    const deleteHandler = async (id: string): Promise<boolean> => {
        setIsLoading(true);
        try {
            const ok = await runAction(async () => {
                await deploysService.deleteHandler(id);
                return true;
            }, {
                errorFallback: deploysConstants.errors.deleteFailed,
                successMessage: deploysConstants.messages.deleteSuccess,
                context: "deploys.delete",
            });
            return ok ?? false;
        } finally {
            setIsLoading(false);
        }
    };

    return { deleteHandler, isLoading };
};
