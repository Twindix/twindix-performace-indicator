import { Plus, Tag, X } from "lucide-react";

import { Button, Input } from "@/atoms";
import { t, useTaskTagsForm } from "@/hooks";
import type { TaskTagsSectionPropsInterface } from "@/interfaces";

export const TaskTagsSection = ({ task, canEdit, patchTaskLocal }: TaskTagsSectionPropsInterface) => {
    const form = useTaskTagsForm({ task, patchTaskLocal });

    return (
        <div className="mt-4 pb-4 border-b border-border">
            <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-text-muted flex items-center gap-1">
                    <Tag className="h-3 w-3" />{t("Tags")}
                </p>
                {!form.showTagInput && canEdit && (
                    <button
                        onClick={() => form.setShowTagInput(true)}
                        className="text-xs text-primary hover:text-primary-dark font-medium flex items-center gap-1 cursor-pointer"
                    >
                        <Plus className="h-3 w-3" /> {t("Add")}
                    </button>
                )}
            </div>
            <div className="flex flex-wrap gap-1.5 items-center">
                {task.tags.map((tag) => (
                    <span
                        key={typeof tag === "string" ? tag : tag.id}
                        className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-xs"
                    >
                        {typeof tag === "string" ? tag : tag.tag}
                        {canEdit && (
                            <button
                                onClick={() => form.handleRemoveTag(typeof tag === "string" ? tag : tag.id)}
                                className="text-text-muted hover:text-error cursor-pointer"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        )}
                    </span>
                ))}
                {form.showTagInput && (
                    <div className="flex items-center gap-1">
                        <Input
                            autoFocus
                            value={form.tagInput}
                            onChange={(e) => form.setTagInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); form.handleAddTag(); } }}
                            placeholder={t("Tag name")}
                            className="h-7 text-xs w-28"
                        />
                        <Button size="sm" onClick={form.handleAddTag} className="h-7 px-2 text-xs">{t("Add")}</Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => { form.setShowTagInput(false); form.setTagInput(""); }}
                            className="h-7 px-2 text-xs"
                        >
                            {t("Cancel")}
                        </Button>
                    </div>
                )}
                {task.tags.length === 0 && !form.showTagInput && (
                    <span className="text-xs text-text-muted italic">{t("No tags")}</span>
                )}
            </div>
        </div>
    );
};
