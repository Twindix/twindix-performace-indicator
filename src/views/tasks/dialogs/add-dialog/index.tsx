import { useCallback } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/atoms";
import { t, useAddTaskForm, useTasksListLite } from "@/hooks";
import type { AddTaskDialogProps } from "@/interfaces";
import { useSprintStore } from "@/store";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/ui";

import { AddTaskAttachmentsSection } from "./attachments-section";
import { AddTaskCompoundSection } from "./compound-section";
import { AddTaskDescriptionField } from "./description-field";
import { AddTaskMetaSection } from "./meta-section";
import { AddTaskRequirementsSection } from "./requirements-section";
import { AddTaskScheduleSection } from "./schedule-section";
import { AddTaskTagsSection } from "./tags-section";
import { AddTaskTitleField } from "./title-field";

export const AddTaskDialog = ({ open, onOpenChange, members, addTaskLocal }: AddTaskDialogProps) => {
    const { activeSprintId } = useSprintStore();
    const { tasks: sprintTasks } = useTasksListLite({ sprint_id: activeSprintId ?? undefined, exclude_done: true });

    const form = useAddTaskForm({
        sprintId: activeSprintId,
        onClose: () => onOpenChange(false),
        addTaskLocal,
    });

    const handleOpenChange = useCallback((newOpen: boolean) => {
        if (!newOpen) form.resetForm();
        onOpenChange(newOpen);
    }, [onOpenChange, form]);

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-2 mb-1">
                        <Plus className="h-5 w-5 text-primary" />
                        <DialogTitle>{t("Add New Task")}</DialogTitle>
                    </div>
                    <DialogDescription>{t("Create a new task and assign it to a team member")}</DialogDescription>
                </DialogHeader>

                <form onSubmit={form.handleSubmit} className="space-y-5 mt-4">
                    <AddTaskTitleField
                        value={form.formState.title}
                        onChange={(v) => form.updateField("title", v)}
                        error={form.getError("title")}
                    />

                    <AddTaskDescriptionField
                        value={form.formState.description}
                        onChange={(v) => form.updateField("description", v)}
                        error={form.getError("description")}
                    />

                    <AddTaskRequirementsSection
                        requirements={form.formState.requirements}
                        input={form.requirementInput}
                        onInputChange={form.setRequirementInput}
                        onAdd={form.addRequirement}
                        onRemove={form.removeRequirement}
                        inputRef={form.requirementInputRef}
                    />

                    <AddTaskTagsSection
                        tags={form.formState.tags}
                        input={form.tagInput}
                        onInputChange={form.setTagInput}
                        onAdd={form.addTag}
                        onRemove={form.removeTag}
                        inputRef={form.tagInputRef}
                    />

                    <AddTaskAttachmentsSection
                        files={form.formState.files}
                        onFileAdd={form.handleFileAdd}
                        onRemove={form.removeFile}
                    />

                    <AddTaskMetaSection
                        formState={form.formState}
                        onChange={form.updateField}
                        getError={form.getError}
                        members={members}
                    />

                    <AddTaskScheduleSection
                        deadline={form.deadline}
                        onDeadlineChange={(v) => { form.setDeadline(v); form.clearError("dead_time"); }}
                        deadlineError={form.getError("dead_time")}
                        taskType={form.compound.taskType}
                        onTaskTypeChange={form.setTaskType}
                    />

                    <AddTaskCompoundSection
                        sprintTasks={sprintTasks}
                        members={members}
                        state={form.compound}
                        onStartAfterEnabledChange={form.setStartAfterEnabled}
                        onStartAfterTaskIdChange={form.setStartAfterTaskId}
                        onNotifyEnabledChange={form.setNotifyEnabled}
                        onNotifyUserIdsChange={form.setNotifyUserIds}
                    />

                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                        <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={form.isSubmitting}>
                            {t("Cancel")}
                        </Button>
                        <Button type="submit" loading={form.isSubmitting} className="gap-2">
                            {!form.isSubmitting && <Plus className="h-4 w-4" />}
                            {t("Create Task")}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export { AddTaskTitleField } from "./title-field";
export { AddTaskDescriptionField } from "./description-field";
export { AddTaskRequirementsSection } from "./requirements-section";
export { AddTaskTagsSection } from "./tags-section";
export { AddTaskAttachmentsSection } from "./attachments-section";
export { AddTaskMetaSection } from "./meta-section";
export { AddTaskScheduleSection } from "./schedule-section";
export { AddTaskCompoundSection } from "./compound-section";
