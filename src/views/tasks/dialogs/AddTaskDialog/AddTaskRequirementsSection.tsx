import { ListChecks, Plus, X } from "lucide-react";

import { Button, Input, Label } from "@/atoms";
import { t } from "@/hooks";
import type { AddTaskRequirementsSectionPropsInterface } from "@/interfaces";

export const AddTaskRequirementsSection = ({
    requirements,
    input,
    onInputChange,
    onAdd,
    onRemove,
    inputRef,
}: AddTaskRequirementsSectionPropsInterface) => (
    <div className="space-y-2">
        <Label className="flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-text-muted" />
            {t("Requirements")}
        </Label>
        <div className="flex gap-2">
            <Input
                ref={inputRef}
                placeholder={t("Add a requirement...")}
                value={input}
                onChange={(e) => onInputChange(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onAdd(); } }}
                className="flex-1"
            />
            <Button type="button" variant="outline" onClick={onAdd} className="gap-1.5 shrink-0">
                <Plus className="h-4 w-4" />
                {t("Add")}
            </Button>
        </div>
        {requirements.length > 0 && (
            <div className="space-y-2 mt-2">
                {requirements.map((req) => (
                    <div key={req.id} className="flex items-center gap-3 rounded-lg border border-border bg-muted px-3 py-2">
                        <span className="flex-1 text-sm text-text-dark">{req.label}</span>
                        <button
                            type="button"
                            onClick={() => onRemove(req.id)}
                            className="p-1 rounded-full hover:bg-surface text-text-muted hover:text-error transition-colors shrink-0"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ))}
            </div>
        )}
    </div>
);
