import { t } from "@/hooks";
import type { PipelineViewPropsInterface } from "@/interfaces";

import { PipelineColumn } from "./PipelineColumn";

export const PipelineView = ({ pipeline, onSelectTask }: PipelineViewPropsInterface) => {
    const columns = Object.entries(pipeline);

    if (columns.length === 0) {
        return (
            <div className="flex items-center justify-center h-48 text-text-muted text-sm">
                {t("No pipeline data available")}
            </div>
        );
    }

    return (
        <div className="flex flex-1 gap-4 pb-4 overflow-x-auto min-h-[calc(100vh-14rem)] bg-surface-body p-4 rounded-xl">
            {columns.map(([colKey, tasks]) => (
                <PipelineColumn
                    key={colKey}
                    columnKey={colKey}
                    tasks={tasks}
                    onSelectTask={onSelectTask}
                />
            ))}
        </div>
    );
};
