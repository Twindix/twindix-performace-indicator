import { CalendarClock, ListChecks } from "lucide-react";

import { Input, Label } from "@/atoms";
import { t } from "@/hooks";
import type { AddTaskScheduleSectionPropsInterface } from "@/interfaces";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui";

export const AddTaskScheduleSection = ({
    deadline,
    onDeadlineChange,
    deadlineError,
    taskType,
    onTaskTypeChange,
}: AddTaskScheduleSectionPropsInterface) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
            <Label htmlFor="deadline" className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-text-muted" />
                {t("Dead Time")}
            </Label>
            <Input
                id="deadline"
                type="datetime-local"
                value={deadline}
                onChange={(e) => onDeadlineChange(e.target.value)}
            />
            {deadlineError && <p className="text-xs text-error">{deadlineError}</p>}
        </div>

        <div className="space-y-2">
            <Label htmlFor="taskType" className="flex items-center gap-2">
                <ListChecks className="h-4 w-4 text-text-muted" />
                {t("Task Type")}
            </Label>
            <Select value={taskType} onValueChange={(v) => onTaskTypeChange(v as "standalone" | "compound")}>
                <SelectTrigger id="taskType" className="w-full">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="standalone">{t("Stand-alone")}</SelectItem>
                    <SelectItem value="compound">{t("Compound")}</SelectItem>
                </SelectContent>
            </Select>
        </div>
    </div>
);
