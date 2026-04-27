import { t } from "@/hooks";
import type { AddTaskCompoundSectionPropsInterface } from "@/interfaces";
import { Checkbox } from "@/ui";

import { TaskAutocomplete, UsersAutocomplete } from "../../components";

export const AddTaskCompoundSection = ({
    sprintTasks,
    members,
    state,
    onStartAfterEnabledChange,
    onStartAfterTaskIdChange,
    onNotifyEnabledChange,
    onNotifyUserIdsChange,
}: AddTaskCompoundSectionPropsInterface) => {
    if (state.taskType !== "compound") return null;

    return (
        <div className="flex flex-col gap-4 rounded-lg border border-border bg-muted/50 p-3">
            <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-sm text-text-dark cursor-pointer">
                    <Checkbox
                        checked={state.startAfterEnabled}
                        onCheckedChange={(v) => onStartAfterEnabledChange(v === true)}
                    />
                    {t("Start only if other task done")}
                </label>
                {state.startAfterEnabled && (
                    <TaskAutocomplete
                        tasks={sprintTasks}
                        value={state.startAfterTaskId}
                        onChange={onStartAfterTaskIdChange}
                        placeholder={t("Search tasks in this sprint...")}
                    />
                )}
            </div>
            <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-sm text-text-dark cursor-pointer">
                    <Checkbox
                        checked={state.notifyEnabled}
                        onCheckedChange={(v) => onNotifyEnabledChange(v === true)}
                    />
                    {t("Notify others when done")}
                </label>
                {state.notifyEnabled && (
                    <UsersAutocomplete
                        members={members}
                        values={state.notifyUserIds}
                        onChange={onNotifyUserIdsChange}
                        placeholder={t("Search users to notify...")}
                    />
                )}
            </div>
        </div>
    );
};
