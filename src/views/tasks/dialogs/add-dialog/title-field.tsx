import { FileText } from "lucide-react";

import { Input, Label } from "@/atoms";
import { t } from "@/hooks";
import type { AddTaskTitleFieldPropsInterface } from "@/interfaces";

export const AddTaskTitleField = ({ value, onChange, error }: AddTaskTitleFieldPropsInterface) => (
    <div className="space-y-2">
        <Label htmlFor="title" className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-text-muted" />
            {t("Title")} <span className="text-error">*</span>
        </Label>
        <Input
            id="title"
            placeholder={t("Enter task title")}
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
        {error && <p className="text-xs text-error">{error}</p>}
    </div>
);
