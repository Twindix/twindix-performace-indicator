import { useEffect, useState } from "react";
import { Plus, ShieldAlert } from "lucide-react";

import { Button, Input, Label, Textarea } from "@/atoms";
import { BlockerType } from "@/enums";
import { t } from "@/utils";
import { useCreateBlocker, useUpdateBlocker } from "@/hooks";
import type { BlockerInterface, UserInterface } from "@/interfaces";
import {
    Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle,
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/ui";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    sprintId: string | null | undefined;
    initial?: BlockerInterface | null;
    users: UserInterface[];
    onSaved: (blocker: BlockerInterface) => void;
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
    { value: "critical", label: "Critical" },
    { value: "high", label: "High" },
    { value: "medium", label: "Medium" },
    { value: "low", label: "Low" },
];

export const BlockerFormDialog = ({ open, onOpenChange, sprintId, initial, users, onSaved }: Props) => {
    const { createHandler: createBlockerHandler, isLoading: isCreating } = useCreateBlocker();
    const { updateHandler: updateBlockerHandler, isLoading: isUpdating } = useUpdateBlocker();
    const isSubmitting = isCreating || isUpdating;
    const isEdit = Boolean(initial);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [severity, setSeverity] = useState<string>("medium");
    const [type, setType] = useState<string>(BlockerType.Technical);
    const [ownedBy, setOwnedBy] = useState<string>("");

    useEffect(() => {
        if (!open) return;
        if (initial) {
            setTitle(initial.title);
            setDescription(initial.description ?? "");
            setSeverity(initial.severity);
            setType(initial.type);
            setOwnedBy(initial.owner?.id ?? "");
        } else {
            setTitle("");
            setDescription("");
            setSeverity("medium");
            setType(BlockerType.Technical);
            setOwnedBy("");
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
            });
        }
        if (result) {
            onSaved(result);
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
                            <Select value={type} onValueChange={setType}>
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
                                {users.map((u) => (
                                    <SelectItem key={u.id} value={u.id}>{u.full_name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                    <DialogClose asChild>
                        <Button variant="outline" disabled={isSubmitting}>{t("Cancel")}</Button>
                    </DialogClose>
                    <Button onClick={handleSubmit} loading={isSubmitting} disabled={!canSubmit} className="gap-2">
                        {!isEdit && !isSubmitting && <Plus className="h-4 w-4" />}
                        {isEdit ? t("Save Changes") : t("Create Blocker")}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
