import { TasksSkeleton } from "@/components/skeletons";
import { useTasksView } from "@/hooks";
import { TaskPhase } from "@/enums";

import { TasksContent, TasksFilters, TasksHeader } from "./components";
import { TaskDetailDialog } from "./TaskDetailDialog";
import { AddTaskDialog } from "./add-task-dialog";
import { TransitionDialog } from "./TransitionDialog";

export const TasksView = () => {
    const view = useTasksView();

    if (view.isLoading && view.tasks.length === 0) return <TasksSkeleton />;

    const hasFiltersOrTasks = view.tasks.length > 0 || view.filters.isAnyApplied;

    return (
        <div>
            <TasksHeader
                actions={{
                    canCreate: view.permissions.tasks.create(),
                    onCreate: view.dialogs.openAdd,
                    hasFiltersOrTasks,
                    stats: view.stats,
                }}
            />

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
                onMoveRequest={(task, targetPhase) => {
                    view.dialogs.setDetailOpen(false);
                    view.dialogs.transition.open(task, targetPhase);
                }}
                onUpdateRequirements={() => {}}
                patchTaskLocal={(id, updates) => {
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
                onOpenChange={(open) => {
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
                onOpenChange={(open) => { if (!open) view.dialogs.transition.close(); }}
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
