import { useState } from "react";

import { reportsConstants } from "@/constants";
import type { ReportExportFormat, ReportSectionKey } from "@/interfaces";
import { runAction } from "@/lib/handle-action";
import { reportsService } from "@/services";

export const useExportReportSection = () => {
    const [isLoading, setIsLoading] = useState(false);

    const exportHandler = async (
        projectId: string,
        section: ReportSectionKey,
        format: ReportExportFormat,
    ): Promise<boolean> => {
        setIsLoading(true);
        try {
            const result = await runAction(() => reportsService.exportHandler(projectId, section, format), {
                errorFallback: reportsConstants.errors.exportFailed,
                context: "reports.export",
            });
            if (!result) return false;
            // Trigger browser download
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

    return { exportHandler, isLoading };
};
