import type { DragEvent } from "react";
import { Circle, GripVertical, Lock } from "lucide-react";

import { Badge } from "@/atoms";
import { TaskPriority } from "@/enums";
import type { KanbanBoardInterface, TaskInterface } from "@/interfaces";
import { t } from "@/hooks";
import { cn } from "@/utils";

const COLUMNS = [
    { status: "backlog", label: "Backlog" },
    { status: "ready", label: "Ready" },
    { status: "in_progress", label: "In Progress" },
    { status: "review", label: "Review" },
    { status: "qa", label: "QA" },
    { status: "done", label: "Done" },
] as const;

const COLUMN_COLORS: Record<string, string> = {
    backlog: "bg-text-muted",
    ready: "bg-primary",
    in_progress: "bg-warning",
    review: "bg-[#8b5cf6]",
    qa: "bg-[#ec4899]",
    done: "bg-success",
};

const PRIORITY_VARIANT: Record<string, "error" | "warning" | "default" | "secondary"> = {
    critical: "error",
    high: "warning",
    medium: "default",
    low: "secondary",
};

export interface BoardViewProps {
    kanban: KanbanBoardInterface;
    draggedTask: TaskInterface | null;
    dragOverStatus: string | null;
    handleDragStart: (e: DragEvent<HTMLDivElement>, task: TaskInterface) => void;
    handleDragOver: (e: DragEvent<HTMLDivElement>) => void;
    handleDragEnter: (e: DragEvent<HTMLDivElement>, status: string) => void;
    handleDragLeave: (e: DragEvent<HTMLDivElement>) => void;
    handleDrop: (e: DragEvent<HTMLDivElement>, targetStatus: string) => void;
    setSelectedTask: (task: TaskInterface) => void;
    setDialogOpen: (open: boolean) => void;
}

export const BoardView = ({
    kanban,
    draggedTask,
    dragOverStatus,
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
            {COLUMNS.map(({ status, label }) => {
                const columnTasks = kanban[status] ?? [];

                return (
                    <div
                        key={status}
                        className={cn(
                            "flex flex-col w-80 shrink-0 bg-surface rounded-xl overflow-hidden border transition-colors",
                            dragOverStatus === status ? "border-primary bg-primary-lighter/10" : "border-border"
                        )}
                        onDragOver={handleDragOver}
                        onDragEnter={(e) => handleDragEnter(e, status)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, status)}
                    >
                        <div className="p-3 bg-muted/50 border-b border-border flex items-center justify-between sticky top-0 z-10 hidden-scrollbar">
                            <h3 className="text-sm font-bold text-text-dark flex items-center gap-2">
                                <Circle className={cn("h-2.5 w-2.5 fill-current", COLUMN_COLORS[status].replace("bg-", "text-"))} />
                                {t(label)}
                            </h3>
                            <span className="text-[10px] font-semibold text-text-muted bg-surface px-2 py-0.5 rounded-full border border-border">
                                {columnTasks.length}
                            </span>
                        </div>

                        <div className="flex-1 p-2 overflow-y-auto space-y-2 relative pointer-events-auto">
                            {columnTasks.length === 0 && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <p className="text-xs text-text-muted italic">{t("Drop tasks here")}</p>
                                </div>
                            )}

                            {columnTasks.map((task) => (
                                <div
                                    key={task.id}
                                    draggable
                                    className={cn(
                                        "bg-surface rounded-lg p-3 border cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-all z-20 pointer-events-auto relative",
                                        task.is_blocked ? "border-error bg-error/5" : "border-border",
                                        draggedTask?.id === task.id ? "opacity-50 scale-95" : (!task.is_blocked && "hover:border-primary"),
                                        dragOverStatus === status ? "pointer-events-none" : ""
                                    )}
                                    onDragStart={(e) => handleDragStart(e, task)}
                                    onClick={() => { setSelectedTask(task); setDialogOpen(true); }}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                            <GripVertical className="h-4 w-4 text-text-muted shrink-0 cursor-grab" />
                                            <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0", COLUMN_COLORS[task.status ?? "backlog"], "text-white")}>
                                                {task.task_number ?? task.id}
                                            </span>
                                            {task.is_blocked && <Lock className="h-3 w-3 text-error shrink-0" />}
                                        </div>
                                    </div>

                                    <h4 className="text-sm font-semibold text-text-dark mb-2 leading-tight line-clamp-2">
                                        {task.title}
                                    </h4>

                                    <div className="flex items-center gap-1 mb-3 flex-wrap">
                                        {task.tags.map((tag) => (
                                            <span key={typeof tag === "string" ? tag : tag.id} className="text-[9px] font-medium text-text-secondary bg-muted px-1.5 py-0.5 rounded">
                                                #{typeof tag === "string" ? tag : tag.tag}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-1.5">
                                        <Badge variant={PRIORITY_VARIANT[task.priority as TaskPriority] ?? "default"} className="text-[9px] px-1.5 py-0.5 rounded shadow-sm relative z-30">
                                            {t(task.priority.charAt(0).toUpperCase() + task.priority.slice(1))}
                                        </Badge>
                                        {(task.story_points ?? 0) > 0 && (
                                            <span className="text-[10px] font-semibold text-text-muted bg-muted rounded-full h-5 w-5 flex items-center justify-center relative z-30">
                                                {task.story_points}
                                            </span>
                                        )}
                                        {task.assignee && (
                                            <span className="ml-auto text-[10px] font-medium bg-primary/10 text-primary rounded-full px-1.5 py-0.5">
                                                {task.assignee.avatar_initials}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
