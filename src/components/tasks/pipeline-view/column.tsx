import { Circle } from "lucide-react";

import { tasksConstants } from "@/constants";
import { t } from "@/hooks";
import type { PipelineColumnPropsInterface } from "@/interfaces";
import { cn } from "@/utils";

import { TaskPipelineCard } from "./pipeline-card";

export const PipelineColumn = ({ columnKey, tasks, onSelectTask }: PipelineColumnPropsInterface) => {
    const colorClass = tasksConstants.pipelineColumnColorClass[columnKey] ?? "text-text-muted";
    const label = columnKey.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

    return (
        <div className="flex flex-col w-80 shrink-0 bg-surface rounded-xl overflow-hidden border border-border shadow-sm">
            <div className="p-3 border-b border-border flex items-center justify-between sticky top-0 z-10 hidden-scrollbar bg-surface relative">
                <h3 className="text-sm font-bold text-text-dark flex items-center gap-2">
                    <Circle className={cn("h-2.5 w-2.5 fill-current", colorClass)} />
                    {t(label)}
                </h3>
                <span className="text-[10px] font-semibold text-text-muted bg-muted px-2 py-0.5 rounded-full border border-border">
                    {tasks.length}
                </span>
            </div>

            <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                {tasks.length === 0 && (
                    <p className="text-xs text-text-muted italic text-center py-8">{t("No tasks")}</p>
                )}
                {tasks.map((task) => (
                    <TaskPipelineCard
                        key={task.id}
                        task={task}
                        onClick={() => onSelectTask(task)}
                    />
                ))}
            </div>
        </div>
    );
};
