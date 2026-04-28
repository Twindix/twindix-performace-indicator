import { Plus } from "lucide-react";

import { Badge, Button } from "@/atoms";
import { TasksSkeleton } from "@/components/skeletons";
import { PageHeader } from "@/components/shared";
import { TaskPhase } from "@/enums";
import { t, useTasksView } from "@/hooks";
import type { TaskInterface } from "@/interfaces";

import { TasksContent, TasksFilters } from "./components";

import { AddTaskDialog, TaskDetailDialog, TransitionDialog } from "./dialogs";

export const TasksView = () => {
    const view = useTasksView();

    if (view.isLoading && view.tasks.length === 0) return <TasksSkeleton />;

    const hasFiltersOrTasks = view.tasks.length > 0 || view.filters.isAnyApplied;

    return (
        <div>
            <PageHeader
                title={t("Task Management")}
                description={t("Use the task detail dialog to move tasks between phases.")}
            >
                <PageHeader.Actions>
                    {!hasFiltersOrTasks ? (
                        view.permissions.tasks.create() ? (
                            <Button size="sm" className="gap-1.5" onClick={view.dialogs.openAdd}>
                                <Plus className="h-4 w-4" />
                                {t("Add Task")}
                            </Button>
                        ) : null
                    ) : (
                        <div className="flex items-center gap-2 text-sm text-text-secondary">
                            <span><strong className="text-text-dark">{view.stats.total}</strong> {t("tasks")}</span>
                            <span className="text-border">|</span>
                            <span><strong className="text-text-dark">{view.stats.donePoints}</strong>/{view.stats.totalPoints} {t("pts")}</span>
                            {view.stats.blocked > 0 && (
                                <>
                                    <span className="text-border">|</span>
                                    <Badge variant="error">{view.stats.blocked} {t("blocked")}</Badge>
                                </>
                            )}
                        </div>
                    )}
                </PageHeader.Actions>
            </PageHeader>

            <TasksFilters
                search={{ value: view.filters.search, onChange: view.filters.setSearch }}
                filters={{
                    values: view.filters.values,
                    onChange: view.filters.onChange,
                    onClear: view.filters.onClear,
                }}
                viewMode={view.viewMode}
                users={view.users}
                canCreate={view.permissions.tasks.create()}
                onCreate={view.dialogs.openAdd}
            />

            <TasksContent
                viewMode={view.viewMode.value}
                kanban={view.kanban}
                pipeline={view.pipeline}
                isEmpty={view.isEmpty}
                onSelectTask={(task) => {
                    view.dialogs.setSelectedTask(task);
                    view.dialogs.setDetailOpen(true);
                }}
            />

            <TaskDetailDialog
                task={view.dialogs.selectedTask}
                members={view.users}
                blocker={undefined}
                open={view.dialogs.detailOpen}
                onOpenChange={view.dialogs.setDetailOpen}
                onMoveRequest={(task: TaskInterface, targetPhase: TaskPhase) => {
                    view.dialogs.setDetailOpen(false);
                    view.dialogs.transition.open(task, targetPhase);
                }}
                patchTaskLocal={(id: string, updates: Partial<TaskInterface>) => {
                    const existing = view.tasks.find((t) => t.id === id);
                    if (!existing) return;
                    const merged = { ...existing, ...updates };
                    view.patchTaskLocal(merged);
                    view.dialogs.setSelectedTask(view.dialogs.selectedTask && view.dialogs.selectedTask.id === id ? merged : view.dialogs.selectedTask);
                }}
                removeTaskLocal={view.removeTaskLocal}
            />

            <AddTaskDialog
                open={view.dialogs.addOpen}
                onOpenChange={(open: boolean) => {
                    if (!open) {
                        view.dialogs.closeAdd();
                        view.refetch();
                    } else {
                        view.dialogs.openAdd();
                    }
                }}
                members={view.users}
                sprintId={view.activeSprintId}
                addTaskLocal={view.addTaskLocal}
            />

            <TransitionDialog
                open={view.dialogs.transition.isOpen}
                onOpenChange={(open: boolean) => { if (!open) view.dialogs.transition.close(); }}
                task={view.dialogs.transition.task}
                targetPhase={view.dialogs.transition.targetPhase as TaskPhase | null}
                onConfirm={view.onConfirmTransition}
                isAssignee={Boolean(
                    view.dialogs.transition.task &&
                    view.currentUserId &&
                    view.dialogs.transition.task.assignee?.id === view.currentUserId,
                )}
                isSubmitting={view.isUpdatingStatus}
            />
        </div>
    );
};
