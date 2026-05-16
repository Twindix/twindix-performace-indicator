import { useState } from "react";

import { deploysConstants } from "@/constants";
import { runAction } from "@/lib/handle-action";
import { deploysService } from "@/services";

export const useDownloadDeploy = () => {
    const [isLoading, setIsLoading] = useState(false);

    const downloadHandler = async (id: string, fallbackFilename: string): Promise<boolean> => {
        setIsLoading(true);
        try {
            const result = await runAction(() => deploysService.downloadHandler(id, fallbackFilename), {
                errorFallback: deploysConstants.errors.downloadFailed,
                context: "deploys.download",
            });
            if (!result) return false;
            const url = URL.createObjectURL(result.blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = result.filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            return true;
        } finally {
            setIsLoading(false);
        }
    };

    return { downloadHandler, isLoading };
};
