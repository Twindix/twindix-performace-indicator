import type { DragEvent } from "react";
import { Circle, GripVertical, Lock } from "lucide-react";

import { Badge } from "@/atoms";
import { TaskPhase } from "@/enums";
import type { TaskInterface } from "@/interfaces";
import { t } from "@/hooks";
import { cn } from "@/utils";
import { COLUMNS, COLUMN_COLORS, PRIORITY_VARIANT } from "../../data/seed/constants";

export interface BoardViewProps {
    tasksByPhase: Map<TaskPhase, TaskInterface[]>;
    draggedTask: TaskInterface | null;
    dragOverPhase: TaskPhase | null;
    handleDragStart: (e: DragEvent<HTMLDivElement>, task: TaskInterface) => void;
    handleDragOver: (e: DragEvent<HTMLDivElement>) => void;
    handleDragEnter: (e: DragEvent<HTMLDivElement>, phase: TaskPhase) => void;
    handleDragLeave: (e: DragEvent<HTMLDivElement>) => void;
    handleDrop: (e: DragEvent<HTMLDivElement>, targetPhase: TaskPhase) => void;
    setSelectedTask: (task: TaskInterface) => void;
    setDialogOpen: (open: boolean) => void;
}

export const BoardView = ({
    tasksByPhase,
    draggedTask,
    dragOverPhase,
    handleDragStart,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    setSelectedTask,
    setDialogOpen,
}: BoardViewProps) => {
    return (
        <div className="flex flex-1 gap-4 pb-4 overflow-x-auto min-h-[calc(100vh-14rem)]">
            {COLUMNS.map(({ phase, label }) => {
                const columnTasks = tasksByPhase.get(phase) ?? [];

                return (
                    <div
                        key={phase}
                        className={cn(
                            "flex flex-col w-80 shrink-0 bg-surface rounded-xl overflow-hidden border transition-colors",
                            dragOverPhase === phase ? "border-primary bg-primary-lighter/10" : "border-border"
                        )}
                        onDragOver={handleDragOver}
                        onDragEnter={(e) => handleDragEnter(e, phase)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, phase)}
                    >
                        {/* Column Header */}
                        <div className="p-3 bg-muted/50 border-b border-border flex items-center justify-between sticky top-0 z-10 hidden-scrollbar">
                            <h3 className="text-sm font-bold text-text-dark flex items-center gap-2">
                                <Circle className={cn("h-2.5 w-2.5 fill-current", COLUMN_COLORS[phase].replace("bg-", "text-"))} />
                                {t(label)}
                            </h3>
                            <span className="text-[10px] font-semibold text-text-muted bg-surface px-2 py-0.5 rounded-full border border-border">
                                {columnTasks.length}
                            </span>
                        </div>

                        {/* Task List */}
                        <div className="flex-1 p-2 overflow-y-auto space-y-2 relative pointer-events-auto">
                            {columnTasks.length === 0 && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <p className="text-xs text-text-muted italic">{t("Drop tasks here")}</p>
                                </div>
                            )}

                            {columnTasks.map((task) => {
                                return (
                                    <div
                                        key={task.id}
                                        draggable
                                        className={cn(
                                            "bg-surface rounded-lg p-3 border cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-all z-20 pointer-events-auto relative",
                                            task.hasBlocker ? "border-error/50 bg-error-light/10" : "border-border",
                                            draggedTask?.id === task.id ? "opacity-50 scale-95" : "hover:border-primary",
                                            dragOverPhase === phase ? "pointer-events-none" : ""
                                        )}
                                        onDragStart={(e) => handleDragStart(e, task)}
                                        onClick={() => {
                                            setSelectedTask(task);
                                            setDialogOpen(true);
                                        }}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                                <GripVertical className="h-4 w-4 text-text-muted shrink-0 cursor-grab" />
                                                <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0", COLUMN_COLORS[task.phase], "text-white")}>
                                                    {task.id}
                                                </span>
                                                {task.hasBlocker && <Lock className="h-3 w-3 text-error shrink-0" />}
                                            </div>
                                        </div>

                                        <h4 className="text-sm font-semibold text-text-dark mb-2 leading-tight line-clamp-2">
                                            {task.title}
                                        </h4>

                                        <div className="flex items-center gap-1 mb-3 flex-wrap">
                                            {task.tags.map((tag) => (
                                                <span key={tag} className="text-[9px] font-medium text-text-secondary bg-muted px-1.5 py-0.5 rounded">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>

                                        <div className="flex items-center gap-1.5">
                                                <Badge variant={PRIORITY_VARIANT[task.priority]} className="text-[9px] px-1.5 py-0.5 rounded shadow-sm relative z-30">
                                                    {t(task.priority.charAt(0).toUpperCase() + task.priority.slice(1))}
                                                </Badge>
                                                {task.storyPoints > 0 && (
                                                    <span className="text-[10px] font-semibold text-text-muted bg-muted rounded-full h-5 w-5 flex items-center justify-center relative z-30">
                                                        {task.storyPoints}
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
