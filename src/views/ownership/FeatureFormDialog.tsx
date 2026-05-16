import { useEffect, useState } from "react";

import { Button, Input, Label, Textarea } from "@/atoms";
import { t, useCreateFeature, useFormErrors, useProjectsListLite } from "@/hooks";
import type { FeatureStatus } from "@/interfaces";
import {
    Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle,
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/ui";

interface FeatureFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreated?: () => void;
}

const STATUS_OPTIONS: FeatureStatus[] = ["draft", "active", "shipped", "archived"];

export const FeatureFormDialog = ({ open, onOpenChange, onCreated }: FeatureFormDialogProps) => {
    const { projects } = useProjectsListLite();
    const { setFieldErrors, getError, clear: clearFieldErrors } = useFormErrors();
    const { createHandler, isLoading } = useCreateFeature({ onFieldErrors: setFieldErrors });

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [projectId, setProjectId] = useState("");
    const [status, setStatus] = useState<FeatureStatus>("draft");
    const [tagsInput, setTagsInput] = useState("");

    useEffect(() => {
        if (open) {
            setTitle("");
            setDescription("");
            setProjectId("");
            setStatus("draft");
            setTagsInput("");
            clearFieldErrors();
        }
    }, [open, clearFieldErrors]);

    const canSubmit = title.trim().length > 0 && !!projectId && !isLoading;

    const handleSubmit = async () => {
        if (!canSubmit) return;
        const tags = tagsInput
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);
        const result = await createHandler({
            title: title.trim(),
            description: description.trim() || undefined,
            project_id: projectId,
            status,
            tags: tags.length > 0 ? tags : undefined,
        });
        if (result) {
            onCreated?.();
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{t("Create Feature")}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-2">
                    <div className="space-y-1.5">
                        <Label htmlFor="ft-title">{t("Title")}</Label>
                        <Input id="ft-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("Feature name")} />
                        {getError("title") && <p className="text-[11px] text-error">{getError("title")}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <Label>{t("Project")}</Label>
                        <Select value={projectId} onValueChange={setProjectId}>
                            <SelectTrigger><SelectValue placeholder={t("Select project")} /></SelectTrigger>
                            <SelectContent>
                                {projects.map((p) => (
                                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {getError("project_id") && <p className="text-[11px] text-error">{getError("project_id")}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <Label>{t("Status")}</Label>
                        <Select value={status} onValueChange={(v) => setStatus(v as FeatureStatus)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {STATUS_OPTIONS.map((s) => (
                                    <SelectItem key={s} value={s}>{t(s)}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="ft-tags">{t("Tags")} <span className="text-text-muted">({t("comma-separated")})</span></Label>
                        <Input id="ft-tags" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder={t("e.g. api, payments")} />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="ft-desc">{t("Description")}</Label>
                        <Textarea id="ft-desc" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
                        {getError("description") && <p className="text-[11px] text-error">{getError("description")}</p>}
                    </div>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                    <DialogClose asChild>
                        <Button variant="outline" disabled={isLoading}>{t("Cancel")}</Button>
                    </DialogClose>
                    <Button onClick={handleSubmit} disabled={!canSubmit}>
                        {isLoading ? t("Creating...") : t("Create")}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
