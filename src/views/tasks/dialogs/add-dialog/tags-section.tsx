import { Plus, Tag, X } from "lucide-react";

import { Button, Input, Label } from "@/atoms";
import { t } from "@/hooks";
import type { AddTaskTagsSectionPropsInterface } from "@/interfaces";

export const AddTaskTagsSection = ({
    tags,
    input,
    onInputChange,
    onAdd,
    onRemove,
    inputRef,
}: AddTaskTagsSectionPropsInterface) => (
    <div className="space-y-2">
        <Label className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-text-muted" />
            {t("Tags")}
        </Label>
        <div className="flex gap-2">
            <Input
                ref={inputRef}
                placeholder={t("Add a tag...")}
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
        {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map((tag) => (
                    <span key={tag} className="flex items-center gap-1 text-xs font-medium bg-primary/10 text-primary rounded-full px-2 py-0.5">
                        #{tag}
                        <button type="button" onClick={() => onRemove(tag)} className="hover:text-error transition-colors">
                            <X className="h-3 w-3" />
                        </button>
                    </span>
                ))}
            </div>
        )}
    </div>
);
