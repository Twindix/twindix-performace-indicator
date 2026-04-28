import { AlertCircle, CheckCircle2, ListChecks, Plus } from "lucide-react";

import { Button, Input, Skeleton } from "@/atoms";
import { t, useTaskRequirementsForm } from "@/hooks";
import type { TaskRequirementsSectionPropsInterface } from "@/interfaces";

import { TaskRequirementItem } from "./requirement-item";

export const TaskRequirementsSection = ({
    task,
    canToggleRequirement,
    isFetching,
    patchTaskLocal,
}: TaskRequirementsSectionPropsInterface) => {
    const form = useTaskRequirementsForm({ task, patchTaskLocal });
    const requirements = task.requirements ?? [];

    return (
        <div className="mt-4 pb-4 border-b border-border">
            <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide flex items-center gap-1.5">
                    <ListChecks className="h-3.5 w-3.5" />
                    {t("Requirements")}
                    {requirements.length > 0 && (
                        <span className="bg-muted rounded-full px-1.5 py-0.5 text-[10px] font-bold">{requirements.length}</span>
                    )}
                </p>
                {!form.showReqInput && canToggleRequirement && (
                    <button
                        onClick={() => form.setShowReqInput(true)}
                        className="text-xs text-primary hover:text-primary-dark font-medium flex items-center gap-1 cursor-pointer"
                    >
                        <Plus className="h-3 w-3" /> {t("Add")}
                    </button>
                )}
            </div>
            <div className="space-y-2">
                {isFetching && requirements.length === 0 && (
                    [...Array(2)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3 rounded-lg px-3 py-2 bg-muted">
                            <Skeleton className="h-4 w-4 rounded shrink-0" />
                            <Skeleton className="h-3 flex-1 max-w-xs" />
                        </div>
                    ))
                )}

                {requirements.map((req) => (
                    form.editingReqId === req.id ? (
                        <div key={req.id} className="flex items-center gap-3 rounded-lg px-3 py-2 bg-muted">
                            {req.is_done ? <CheckCircle2 className="h-4 w-4 text-success shrink-0" /> : <AlertCircle className="h-4 w-4 text-text-muted shrink-0" />}
                            <Input
                                autoFocus
                                value={form.editingReqLabel}
                                onChange={(e) => form.setEditingReqLabel(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") form.handleSaveEdit(req);
                                    else if (e.key === "Escape") form.setEditingReqId(null);
                                }}
                                className="h-7 text-sm flex-1"
                            />
                            <Button size="sm" variant="ghost" onClick={() => form.setEditingReqId(null)} className="h-7 px-2 text-xs">{t("Cancel")}</Button>
                        </div>
                    ) : (
                        <TaskRequirementItem
                            key={req.id}
                            req={req}
                            canToggle={canToggleRequirement}
                            onToggle={() => form.handleToggle(req)}
                            onStartEdit={() => { form.setEditingReqId(req.id); form.setEditingReqLabel(req.content ?? ""); }}
                            onDelete={() => form.handleDelete(req.id)}
                        />
                    )
                ))}

                {form.showReqInput && (
                    <div className="flex items-center gap-2">
                        <Input
                            autoFocus
                            value={form.reqInput}
                            onChange={(e) => form.setReqInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") { e.preventDefault(); form.handleAdd(); }
                                else if (e.key === "Escape") { form.setShowReqInput(false); form.setReqInput(""); }
                            }}
                            placeholder={t("Requirement")}
                            className="h-8 text-sm"
                        />
                        <Button size="sm" onClick={form.handleAdd} disabled={!form.reqInput.trim()} loading={form.isAddingReq} className="h-8 px-3 text-xs">{t("Add")}</Button>
                        <Button size="sm" variant="ghost" onClick={() => { form.setShowReqInput(false); form.setReqInput(""); }} className="h-8 px-2 text-xs">{t("Cancel")}</Button>
                    </div>
                )}

                {!isFetching && requirements.length === 0 && !form.showReqInput && (
                    <p className="text-xs text-text-muted italic">{t("No requirements yet")}</p>
                )}
            </div>
        </div>
    );
};
