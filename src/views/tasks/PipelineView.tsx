import { Circle, AlertCircle, Clock } from "lucide-react";
import { Badge } from "@/atoms";
import { TaskPriority } from "@/enums";
import type { TaskInterface, UserInterface } from "@/interfaces";
import { t } from "@/hooks";
import { cn } from "@/utils";
import { PHASE_INDEX, PRIORITY_VARIANT } from "./constants";

export interface PipelineViewProps {
    tasks: TaskInterface[];
    members: UserInterface[];
    setSelectedTask: (task: TaskInterface) => void;
    setDialogOpen: (open: boolean) => void;
}

const WORK_TYPES = ["Design", "Frontend", "Backend", "QA", "Done"] as const;

export const PipelineView = ({
    tasks,
    members,
    setSelectedTask,
    setDialogOpen,
}: PipelineViewProps) => {
    // Group tasks by workType
    const tasksByWorkType = new Map<string, TaskInterface[]>();
    for (const type of WORK_TYPES) {
        tasksByWorkType.set(type, []);
    }

    for (const task of tasks) {
        // Fallback to "Frontend" if undefined for legacy data handling
        const type = task.workType || "Frontend";
        if (tasksByWorkType.has(type)) {
            tasksByWorkType.get(type)!.push(task);
        } else {
            // Push to Done if it doesn't match standard?
            // In a strict enum setup it won't happen, but just in case.
            if (!tasksByWorkType.has("Other")) tasksByWorkType.set("Other", []);
            tasksByWorkType.get("Other")!.push(task);
        }
    }

    const availableWorkTypes = Array.from(tasksByWorkType.keys());

    return (
        <div className="flex flex-1 gap-4 pb-4 overflow-x-auto min-h-[calc(100vh-14rem)] bg-surface-body p-4 rounded-xl">
            {availableWorkTypes.map((type) => {
                const columnTasks = tasksByWorkType.get(type) ?? [];

                return (
                    <div
                        key={type}
                        className="flex flex-col w-80 shrink-0 bg-surface rounded-xl overflow-hidden border border-border shadow-sm"
                    >
                        {/* Column Header */}
                        <div className="p-3 border-b border-border flex items-center justify-between sticky top-0 z-10 hidden-scrollbar bg-surface relative">
                            <h3 className="text-sm font-bold text-text-dark flex items-center gap-2">
                                <Circle className={cn(
                                    "h-2.5 w-2.5 fill-current",
                                    type === "Design" ? "text-purple-500" :
                                        type === "Frontend" ? "text-blue-500" :
                                            type === "Backend" ? "text-green-500" :
                                                type === "QA" ? "text-yellow-500" : "text-gray-500"
                                )} />
                                {t(type)}
                            </h3>
                            <span className="text-[10px] font-semibold text-white bg-primary px-2 py-0.5 rounded-full">
                                {columnTasks.length}
                            </span>
                        </div>

                        {/* Task List */}
                        <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-muted/20">
                            {columnTasks.map((task) => {
                                const assignees = (task.assigneeIds ?? []).map(id => members.find((m) => m.id === id)).filter(Boolean);
                                const assignee = assignees[0]; // Use first assignee for display
                                const progressIndex = PHASE_INDEX[task.phase];
                                const maxStages = 5; // Backlog is 0, Done is 5

                                // Mock data for realism in this view based on screenshot
                                const isOverdue = task.priority === TaskPriority.Critical || task.priority === TaskPriority.High;
                                const reworks = task.priority === TaskPriority.Critical ? 2 : task.priority === TaskPriority.High ? 1 : 0;

                                return (
                                    <div
                                        key={task.id}
                                        className="bg-surface rounded-xl p-4 border border-border hover:shadow-md transition-shadow cursor-pointer pointer-events-auto flex flex-col"
                                        onClick={() => {
                                            setSelectedTask(task);
                                            setDialogOpen(true);
                                        }}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[10px] font-medium text-text-muted flex items-center gap-1">
                                                <Circle className="h-2 w-2 fill-primary text-primary" />
                                                Pipeline Engine {/* Mock project group */}
                                            </span>
                                            <span className="text-text-muted cursor-pointer hover:bg-muted p-1 rounded">
                                                ...
                                            </span>
                                        </div>

                                        <h4 className="text-sm font-bold text-text-dark mb-3 leading-tight line-clamp-2">
                                            {task.title}
                                        </h4>

                                        <div className="flex items-center gap-1.5 mb-5 flex-wrap">
                                            <Badge variant={PRIORITY_VARIANT[task.priority]} className="text-[9px] px-2 shadow-none font-bold bg-opacity-20 text-opacity-100 rounded">
                                                <span className="w-1.5 h-1.5 rounded-full bg-current mr-1 inline-block opacity-80" />
                                                {t(task.priority)}
                                            </Badge>

                                            {reworks > 0 && (
                                                <Badge variant="error" className="text-[9px] px-2 shadow-none font-bold bg-error-light/50 text-error rounded border-none">
                                                    <Clock className="w-2.5 h-2.5 mr-1" />
                                                    {reworks}x rework
                                                </Badge>
                                            )}

                                            {isOverdue && progressIndex < 5 && (
                                                <Badge variant="error" className="text-[9px] px-2 shadow-none font-bold bg-error-light/50 text-error rounded border-none">
                                                    <AlertCircle className="w-2.5 h-2.5 mr-1" />
                                                    Overdue
                                                </Badge>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between mt-auto">
                                            {assignee ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="w-6 h-6 rounded-full bg-primary-lighter text-primary text-[10px] flex items-center justify-center font-bold">
                                                        {(assignee.full_name ?? assignee.name ?? "").split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()}
                                                    </span>
                                                    <span className="text-[10px] text-text-secondary font-medium">
                                                        {progressIndex}/{maxStages} stages
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-[10px] text-text-secondary font-medium">
                                                    {progressIndex}/{maxStages} stages
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
