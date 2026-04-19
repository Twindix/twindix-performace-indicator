import { useState } from "react";
import { Flag, Pencil, Plus, Trash2 } from "lucide-react";

import { Badge, Button, Card, CardContent, Input, Label } from "@/atoms";
import { EmptyState, Header } from "@/components/shared";
import { RedFlagsSkeleton } from "@/components/skeletons";
import { RedFlagsProvider, useRedFlags } from "@/contexts";
import { t, useAuth, useCreateRedFlag, useDeleteRedFlag, usePageLoader, useUpdateRedFlag } from "@/hooks";
import type { RedFlagInterface, RedFlagSeverity, UserInterface } from "@/interfaces";
import { useSprintStore } from "@/store";
import {
    Avatar,
    AvatarFallback,
    Dialog,
    DialogClose,
    DialogContent,
    DialogHeader,
    DialogTitle,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/ui";
import { cn, formatDateTime, getStorageItem, storageKeys } from "@/utils";

const severityConfig: Record<RedFlagSeverity, { label: string; variant: "error" | "warning" | "secondary" | "default"; color: string }> = {
    critical: { label: "Critical", variant: "error", color: "text-error" },
    high:     { label: "High",     variant: "warning", color: "text-warning" },
    medium:   { label: "Medium",   variant: "default", color: "text-primary" },
    low:      { label: "Low",      variant: "secondary", color: "text-text-muted" },
};

const emptyForm = { title: "", description: "", severity: "high" as RedFlagSeverity };

export const RedFlagsView = () => {
    const { activeSprintId } = useSprintStore();
    return (
        <RedFlagsProvider sprintId={activeSprintId}>
            <RedFlagsViewInner />
        </RedFlagsProvider>
    );
};

const RedFlagsViewInner = () => {
    const pageLoading = usePageLoader();
    const { user } = useAuth();
    const { activeSprintId } = useSprintStore();
    const { redFlags: sprintFlags, isLoading: isFetching, patchRedFlagLocal, removeRedFlagLocal, refetchCount } = useRedFlags();
    const { createHandler: createRedFlagHandler } = useCreateRedFlag();
    const { updateHandler: updateRedFlagHandler } = useUpdateRedFlag();
    const { deleteHandler: deleteRedFlagHandler } = useDeleteRedFlag();
    const members = getStorageItem<UserInterface[]>(storageKeys.teamMembers) ?? [];

    const [addOpen, setAddOpen] = useState(false);
    const [viewTarget, setViewTarget] = useState<RedFlagInterface | null>(null);
    const [editTarget, setEditTarget] = useState<RedFlagInterface | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<RedFlagInterface | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState<{ title?: string; description?: string }>({});

    const getMember = (id: string) => members.find((m) => m.id === id);

    const validate = () => {
        const e: typeof errors = {};
        if (!form.title.trim()) e.title = t("Title is required");
        if (!form.description.trim()) e.description = t("Description is required");
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const openAdd = () => {
        setForm(emptyForm);
        setErrors({});
        setAddOpen(true);
    };

    const openEdit = (flag: RedFlagInterface) => {
        setForm({ title: flag.title, description: flag.description, severity: flag.severity });
        setErrors({});
        setEditTarget(flag);
    };

    const handleSubmitAdd = async () => {
        if (!validate()) return;
        if (!activeSprintId) return;
        const res = await createRedFlagHandler(activeSprintId, {
            title: form.title.trim(),
            description: form.description.trim(),
            severity: form.severity,
        });
        if (res) {
            patchRedFlagLocal(res);
            refetchCount();
            setAddOpen(false);
        }
    };

    const handleSubmitEdit = async () => {
        if (!validate() || !editTarget) return;
        const res = await updateRedFlagHandler(editTarget.id, {
            title: form.title.trim(),
            description: form.description.trim(),
            severity: form.severity,
        });
        if (res) {
            patchRedFlagLocal(res);
            setEditTarget(null);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        const ok = await deleteRedFlagHandler(deleteTarget.id);
        if (ok) {
            removeRedFlagLocal(deleteTarget.id);
            refetchCount();
            setDeleteTarget(null);
        }
    };

    if (pageLoading || isFetching) return <RedFlagsSkeleton />;

    return (
        <div>
            <Header
                title={t("Red Flags")}
                description={t("Track critical risks and issues that need immediate attention")}
            />

            {/* Add button */}
            <div className="flex justify-end mb-6">
                <Button onClick={openAdd} className="gap-2">
                    <Plus className="h-4 w-4" />
                    {t("Add Red Flag")}
                </Button>
            </div>

            {/* List */}
            {sprintFlags.length === 0 ? (
                <EmptyState icon={Flag} title={t("No Red Flags")} description={t("No red flags raised for this sprint. Great sign!")} />
            ) : (
                <div className="flex flex-col gap-4">
                    {sprintFlags.map((flag) => {
                        const creator = getMember(flag.createdById);
                        const cfg = severityConfig[flag.severity];
                        const isOwner = user?.id === flag.createdById;

                        return (
                            <Card key={flag.id} className="border-s-4 cursor-pointer hover:shadow-md transition-shadow" style={{ borderLeftColor: `var(--color-${flag.severity === "critical" ? "error" : flag.severity === "high" ? "warning" : flag.severity === "medium" ? "primary" : "muted"})` }} onClick={() => setViewTarget(flag)}>
                                <CardContent className="p-5">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-3 flex-1 min-w-0">
                                            <div className={cn("mt-0.5 shrink-0", cfg.color)}>
                                                <Flag className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                                    <h3 className="text-sm font-semibold text-text-dark">{flag.title}</h3>
                                                    <Badge variant={cfg.variant}>{t(cfg.label)}</Badge>
                                                </div>
                                                <p className="text-sm text-text-secondary mb-3">{flag.description}</p>
                                                <div className="flex items-center gap-3 text-xs text-text-muted flex-wrap">
                                                    {creator && (
                                                        <div className="flex items-center gap-1.5">
                                                            <Avatar className="h-5 w-5">
                                                                <AvatarFallback className="text-[8px]">{creator.avatar}</AvatarFallback>
                                                            </Avatar>
                                                            <span>{creator.name}</span>
                                                        </div>
                                                    )}
                                                    <span>{formatDateTime(flag.createdAt)}</span>
                                                    {flag.updatedAt !== flag.createdAt && (
                                                        <span className="italic">{t("edited")} {formatDateTime(flag.updatedAt)}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {isOwner && (
                                            <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    onClick={() => openEdit(flag)}
                                                    className="p-1.5 rounded-md text-text-muted hover:text-primary hover:bg-primary-lighter transition-colors"
                                                    aria-label="Edit"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteTarget(flag)}
                                                    className="p-1.5 rounded-md text-text-muted hover:text-error hover:bg-error-light transition-colors"
                                                    aria-label="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Details Dialog */}
            <Dialog open={!!viewTarget} onOpenChange={(o) => !o && setViewTarget(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {viewTarget && <Flag className={cn("h-5 w-5", severityConfig[viewTarget.severity].color)} />}
                            {viewTarget?.title}
                        </DialogTitle>
                    </DialogHeader>
                    {viewTarget && (() => {
                        const creator = getMember(viewTarget.createdById);
                        const cfg = severityConfig[viewTarget.severity];
                        const wasEdited = viewTarget.updatedAt !== viewTarget.createdAt;
                        return (
                            <div className="flex flex-col gap-4 py-2">
                                <Badge variant={cfg.variant} className="w-fit">{t(cfg.label)}</Badge>

                                <div>
                                    <p className="text-xs font-medium text-text-muted mb-1">{t("Description")}</p>
                                    <p className="text-sm text-text-secondary">{viewTarget.description}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 border-t border-border pt-3">
                                    <div>
                                        <p className="text-xs font-medium text-text-muted mb-1.5">{t("Raised by")}</p>
                                        {creator && (
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-6 w-6"><AvatarFallback className="text-[9px]">{creator.avatar}</AvatarFallback></Avatar>
                                                <span className="text-sm text-text-secondary">{creator.name}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-text-muted mb-1">{t("Created")}</p>
                                        <p className="text-sm text-text-secondary">{formatDateTime(viewTarget.createdAt)}</p>
                                        {wasEdited && (
                                            <p className="text-xs text-text-muted mt-0.5 italic">{t("Edited")} {formatDateTime(viewTarget.updatedAt)}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })()}
                </DialogContent>
            </Dialog>

            {/* Add Dialog */}
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Flag className="h-5 w-5 text-error" />
                            {t("Raise a Red Flag")}
                        </DialogTitle>
                    </DialogHeader>
                    <FlagForm form={form} setForm={setForm} errors={errors} />
                    <div className="flex justify-end gap-2 mt-2">
                        <DialogClose asChild>
                            <Button variant="outline">{t("Cancel")}</Button>
                        </DialogClose>
                        <Button onClick={handleSubmitAdd}>{t("Submit")}</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={!!editTarget} onOpenChange={(o) => !o && setEditTarget(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Pencil className="h-5 w-5 text-primary" />
                            {t("Edit Red Flag")}
                        </DialogTitle>
                    </DialogHeader>
                    <FlagForm form={form} setForm={setForm} errors={errors} />
                    <div className="flex justify-end gap-2 mt-2">
                        <Button variant="outline" onClick={() => setEditTarget(null)}>{t("Cancel")}</Button>
                        <Button onClick={handleSubmitEdit}>{t("Save Changes")}</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirm Dialog */}
            <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-error">{t("Delete Red Flag")}</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-text-secondary py-2">
                        {t("Are you sure you want to delete")} <span className="font-semibold text-text-dark">"{deleteTarget?.title}"</span>? {t("This cannot be undone.")}
                    </p>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setDeleteTarget(null)}>{t("Cancel")}</Button>
                        <Button variant="destructive" onClick={handleDelete}>{t("Delete")}</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

/* ---------- Shared form ---------- */
interface FlagFormProps {
    form: { title: string; description: string; severity: RedFlagSeverity };
    setForm: (f: FlagFormProps["form"]) => void;
    errors: { title?: string; description?: string };
}

const FlagForm = ({ form, setForm, errors }: FlagFormProps) => (
    <div className="flex flex-col gap-4 py-2">
        <div className="flex flex-col gap-1.5">
            <Label htmlFor="rf-title">{t("Title")}</Label>
            <Input
                id="rf-title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder={t("Short, clear title for the risk")}
                className={errors.title ? "border-error" : ""}
            />
            {errors.title && <p className="text-xs text-error">{errors.title}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
            <Label htmlFor="rf-desc">{t("Description")}</Label>
            <textarea
                id="rf-desc"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder={t("Describe the risk, its impact, and any context")}
                rows={4}
                className={cn(
                    "flex w-full rounded-[var(--radius-default)] border border-input bg-surface px-3 py-2 text-sm text-text-dark placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 resize-none transition-colors",
                    errors.description && "border-error",
                )}
            />
            {errors.description && <p className="text-xs text-error">{errors.description}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
            <Label>{t("Severity")}</Label>
            <Select value={form.severity} onValueChange={(v) => setForm({ ...form, severity: v as RedFlagSeverity })}>
                <SelectTrigger>
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="critical">{t("Critical")}</SelectItem>
                    <SelectItem value="high">{t("High")}</SelectItem>
                    <SelectItem value="medium">{t("Medium")}</SelectItem>
                    <SelectItem value="low">{t("Low")}</SelectItem>
                </SelectContent>
            </Select>
        </div>
    </div>
);
