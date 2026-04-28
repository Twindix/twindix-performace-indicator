import { AlertCircle, Clock, User } from "lucide-react";

import { Input, Label } from "@/atoms";
import { TaskPriority } from "@/enums";
import { t } from "@/hooks";
import type { AddTaskMetaSectionPropsInterface } from "@/interfaces";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui";

const PRIORITY_COLOR: Record<TaskPriority, string> = {
    [TaskPriority.Low]: "text-blue-500",
    [TaskPriority.Medium]: "text-yellow-500",
    [TaskPriority.High]: "text-orange-500",
    [TaskPriority.Critical]: "text-red-500",
};

const PRIORITY_LABEL: Record<TaskPriority, string> = {
    [TaskPriority.Low]: "Low",
    [TaskPriority.Medium]: "Medium",
    [TaskPriority.High]: "High",
    [TaskPriority.Critical]: "Critical",
};

export const AddTaskMetaSection = ({
    formState,
    onChange,
    getError,
    members,
}: AddTaskMetaSectionPropsInterface) => (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
            <Label htmlFor="assignee" className="flex items-center gap-2">
                <User className="h-4 w-4 text-text-muted" />
                {t("Assigned To")} <span className="text-error">*</span>
            </Label>
            <Select value={formState.assigned_to} onValueChange={(v) => onChange("assigned_to", v)}>
                <SelectTrigger id="assignee" className="w-full">
                    <SelectValue placeholder={t("Select assignee")} />
                </SelectTrigger>
                <SelectContent>
                    {members.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-medium bg-muted rounded-full h-5 w-5 flex items-center justify-center">
                                    {member.avatar_initials}
                                </span>
                                <span>{member.full_name}</span>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {getError("assigned_to") && <p className="text-xs text-error">{getError("assigned_to")}</p>}
        </div>

        <div className="space-y-2">
            <Label htmlFor="priority" className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-text-muted" />
                {t("Priority")}
            </Label>
            <Select value={formState.priority} onValueChange={(v) => onChange("priority", v as TaskPriority)}>
                <SelectTrigger id="priority" className="w-full">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {Object.values(TaskPriority).map((p) => (
                        <SelectItem key={p} value={p}>
                            <span className={PRIORITY_COLOR[p]}>{t(PRIORITY_LABEL[p])}</span>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {getError("priority") && <p className="text-xs text-error">{getError("priority")}</p>}
        </div>

        <div className="space-y-2">
            <Label htmlFor="estimatedHours" className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-text-muted" />
                {t("Estimated Hours")} <span className="text-error">*</span>
            </Label>
            <Input
                id="estimatedHours"
                type="number"
                min={0.5}
                step={0.5}
                placeholder={t("Hours")}
                value={formState.estimatedHours || ""}
                onChange={(e) => onChange("estimatedHours", parseFloat(e.target.value) || 0)}
            />
            {getError("estimated_hours") && <p className="text-xs text-error">{getError("estimated_hours")}</p>}
        </div>
    </div>
);
