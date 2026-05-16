import { useState } from "react";

import { featuresConstants } from "@/constants";
import { runAction } from "@/lib/handle-action";
import { featuresService } from "@/services";

export const useDeleteFeature = () => {
    const [isLoading, setIsLoading] = useState(false);

    const deleteHandler = async (id: string): Promise<boolean> => {
        setIsLoading(true);
        try {
            const ok = await runAction(async () => {
                await featuresService.deleteHandler(id);
                return true;
            }, {
                errorFallback: featuresConstants.errors.deleteFailed,
                successMessage: featuresConstants.messages.deleteSuccess,
                context: "features.delete",
            });
            return ok ?? false;
        } finally {
            setIsLoading(false);
        }
    };

    return { deleteHandler, isLoading };
};
