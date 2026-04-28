import { Circle } from "lucide-react";

import { tasksConstants } from "@/constants";
import { TaskPhase } from "@/enums";
import { t } from "@/hooks";
import type { BoardColumnPropsInterface } from "@/interfaces";
import { cn } from "@/utils";

import { TaskKanbanCard } from "./TaskKanbanCard";

export const BoardColumn = ({ status, label, tasks, onSelectTask }: BoardColumnPropsInterface) => {
    const dotColor = (tasksConstants.columnColors[status as TaskPhase] ?? "bg-text-muted").replace("bg-", "text-");

    return (
        <div className="flex flex-col w-80 shrink-0 bg-surface rounded-xl overflow-hidden border border-border">
            <div className="p-3 bg-muted/50 border-b border-border flex items-center justify-between sticky top-0 z-10 hidden-scrollbar">
                <h3 className="text-sm font-bold text-text-dark flex items-center gap-2">
                    <Circle className={cn("h-2.5 w-2.5 fill-current", dotColor)} />
                    {t(label)}
                </h3>
                <span className="text-[10px] font-semibold text-text-muted bg-surface px-2 py-0.5 rounded-full border border-border">
                    {tasks.length}
                </span>
            </div>

            <div className="flex-1 p-2 overflow-y-auto space-y-2 relative pointer-events-auto">
                {tasks.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <p className="text-xs text-text-muted italic">{t("No tasks")}</p>
                    </div>
                )}

                {tasks.map((task) => (
                    <TaskKanbanCard
                        key={task.id}
                        task={task}
                        onClick={() => onSelectTask(task)}
                    />
                ))}
            </div>
        </div>
    );
};
