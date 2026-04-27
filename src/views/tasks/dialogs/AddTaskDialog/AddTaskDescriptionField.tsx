import { FileText } from "lucide-react";

import { Label, Textarea } from "@/atoms";
import { t } from "@/hooks";
import type { AddTaskDescriptionFieldPropsInterface } from "@/interfaces";

export const AddTaskDescriptionField = ({ value, onChange, error }: AddTaskDescriptionFieldPropsInterface) => (
    <div className="space-y-2">
        <Label htmlFor="description" className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-text-muted" />
            {t("Description")}
        </Label>
        <Textarea
            id="description"
            placeholder={t("Enter task description...")}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={3}
        />
        {error && <p className="text-xs text-error">{error}</p>}
    </div>
);
