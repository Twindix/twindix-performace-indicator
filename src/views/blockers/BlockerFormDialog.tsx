import { useEffect, useState } from "react";
import { Plus, ShieldAlert } from "lucide-react";

import { Button, Input, Label, Textarea } from "@/atoms";
import { useBlockers } from "@/contexts";
import { BlockerImpact, BlockerType } from "@/enums";
import { t, useCreateBlocker, useUpdateBlocker } from "@/hooks";
import type { BlockerInterface, TaskInterface, UserInterface } from "@/interfaces";
import { tasksService } from "@/services";
import {
    Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle,
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/ui";
import { usersService } from "@/services";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    sprintId: string | null | undefined;
    initial?: BlockerInterface | null;
}

const TYPE_OPTIONS = [
    { value: BlockerType.Requirements, label: "Requirements" },
    { value: BlockerType.ApiDependency, label: "API Dependency" },
    { value: BlockerType.Design, label: "Design" },
    { value: BlockerType.QAHandoff, label: "QA Handoff" },
    { value: BlockerType.Communication, label: "Communication" },
    { value: BlockerType.Technical, label: "Technical" },
];

const SEVERITY_OPTIONS = [
    { value: BlockerImpact.Critical, label: "Critical" },
    { value: BlockerImpact.High, label: "High" },
    { value: BlockerImpact.Medium, label: "Medium" },
    { value: BlockerImpact.Low, label: "Low" },
];

export const BlockerFormDialog = ({ open, onOpenChange, sprintId, initial }: Props) => {
    const { patchBlockerLocal, refetchAnalytics } = useBlockers();
    const { createHandler: createBlockerHandler, isLoading: isCreating } = useCreateBlocker();
    const { updateHandler: updateBlockerHandler, isLoading: isUpdating } = useUpdateBlocker();
    const isSubmitting = isCreating || isUpdating;
    const isEdit = Boolean(initial);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [severity, setSeverity] = useState<string>(BlockerImpact.Medium);
    const [type, setType] = useState<BlockerType>(BlockerType.Technical);
    const [ownedBy, setOwnedBy] = useState<string>("");
    const [taskIds, setTaskIds] = useState<string[]>([]);

    const [members, setMembers] = useState<UserInterface[]>([]);
    const [tasks, setTasks] = useState<TaskInterface[]>([]);

    useEffect(() => {
        usersService.listHandler().then((res) => setMembers(res.data)).catch(() => {});
    }, []);

    useEffect(() => {
        if (!open || !sprintId) return;
        tasksService.listHandler(sprintId)
            .then((res) => setTasks(res.data))
            .catch(() => setTasks([]));
    }, [open, sprintId]);

    useEffect(() => {
        if (!open) return;
        if (initial) {
            setTitle(initial.title);
            setDescription(initial.description ?? "");
            setSeverity(initial.severity ?? BlockerImpact.Medium);
            setType(initial.type);
            setOwnedBy(initial.owner?.id ?? "");
            setTaskIds([]);
        } else {
            setTitle("");
            setDescription("");
            setSeverity(BlockerImpact.Medium);
            setType(BlockerType.Technical);
            setOwnedBy("");
            setTaskIds([]);
        }
    }, [open, initial]);

    const canSubmit = title.trim().length > 0 && ownedBy && severity && type;

    const handleSubmit = async () => {
        if (!canSubmit) return;
        let result: BlockerInterface | null;
        if (isEdit && initial) {
            result = await updateBlockerHandler(initial.id, {
                title: title.trim(),
                description: description.trim() || undefined,
                severity,
                type,
                owned_by: ownedBy,
            });
        } else {
            if (!sprintId) return;
            result = await createBlockerHandler(sprintId, {
                title: title.trim(),
                description: description.trim() || undefined,
                severity,
                type,
                owned_by: ownedBy,
                task_ids: taskIds.length ? taskIds : undefined,
            });
        }
        if (result) {
            patchBlockerLocal(result);
            refetchAnalytics();
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <ShieldAlert className="h-5 w-5 text-primary" />
                        <DialogTitle>{isEdit ? t("Edit Blocker") : t("Add Blocker")}</DialogTitle>
                    </div>
                </DialogHeader>

                <div className="space-y-4 mt-3">
                    <div className="space-y-2">
                        <Label htmlFor="b-title">{t("Title")} <span className="text-error">*</span></Label>
                        <Input id="b-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("Short summary")} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="b-description">{t("Description")}</Label>
                        <Textarea id="b-description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t("Details...")} />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label>{t("Type")} <span className="text-error">*</span></Label>
                            <Select value={type} onValueChange={(v) => setType(v as BlockerType)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {TYPE_OPTIONS.map((o) => (
                                        <SelectItem key={o.value} value={o.value}>{t(o.label)}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>{t("Severity")} <span className="text-error">*</span></Label>
                            <Select value={severity} onValueChange={setSeverity}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {SEVERITY_OPTIONS.map((o) => (
                                        <SelectItem key={o.value} value={o.value}>{t(o.label)}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>{t("Owned By")} <span className="text-error">*</span></Label>
                        <Select value={ownedBy} onValueChange={setOwnedBy}>
                            <SelectTrigger><SelectValue placeholder={t("Select owner")} /></SelectTrigger>
                            <SelectContent>
                                {members.map((m) => (
                                    <SelectItem key={m.id} value={m.id}>{m.full_name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {!isEdit && tasks.length > 0 && (
                        <div className="space-y-2">
                            <Label>{t("Linked Tasks")}</Label>
                            <div className="max-h-40 overflow-y-auto border border-border rounded-lg p-2 space-y-1">
                                {tasks.map((tk) => {
                                    const checked = taskIds.includes(tk.id);
                                    return (
                                        <label key={tk.id} className="flex items-center gap-2 cursor-pointer rounded px-2 py-1 hover:bg-muted">
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={(e) => {
                                                    setTaskIds((prev) => e.target.checked ? [...prev, tk.id] : prev.filter((i) => i !== tk.id));
                                                }}
                                            />
                                            <span className="text-xs text-text-dark truncate">{tk.title}</span>
                                        </label>
                                    );
                                })}
                            </div>
                            {taskIds.length > 0 && (
                                <p className="text-[10px] text-text-muted">{taskIds.length} {t("tasks selected")}</p>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-2 mt-4">
                    <DialogClose asChild>
                        <Button variant="outline" disabled={isSubmitting}>{t("Cancel")}</Button>
                    </DialogClose>
                    <Button onClick={handleSubmit} disabled={!canSubmit || isSubmitting} className="gap-2">
                        {!isEdit && <Plus className="h-4 w-4" />}
                        {isSubmitting ? t("Saving...") : isEdit ? t("Save Changes") : t("Create Blocker")}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
