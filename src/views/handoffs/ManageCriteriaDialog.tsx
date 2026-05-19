import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { Badge, Button, Input, Label } from "@/atoms";
import {
    t,
    useCreateHandoffCriteria,
    useDeleteHandoffCriteria,
    useHandoffsCriteria,
    useUpdateHandoffCriteria,
} from "@/hooks";
import {
    Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle,
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/ui";
import { cn } from "@/utils";

const DEFAULT_PHASES = ["Product", "Design", "Development", "Code Review", "QA", "Done"];

interface ManageCriteriaDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projectId: string;
}

const phasePairsFrom = (phases: string[]): { from: string; to: string }[] => {
    const out: { from: string; to: string }[] = [];
    for (let i = 0; i < phases.length - 1; i++) {
        out.push({ from: phases[i]!, to: phases[i + 1]! });
    }
    return out;
};

const pairs = phasePairsFrom(DEFAULT_PHASES);

export const ManageCriteriaDialog = ({ open, onOpenChange, projectId }: ManageCriteriaDialogProps) => {
    const { criteria, isLoading, refetch } = useHandoffsCriteria(projectId);
    const { createHandler, isLoading: isCreating } = useCreateHandoffCriteria(projectId);
    const { updateHandler, isLoading: isUpdating } = useUpdateHandoffCriteria();
    const { deleteHandler, isLoading: isDeleting } = useDeleteHandoffCriteria();

    const [draft, setDraft] = useState({
        from_phase: pairs[0]?.from ?? "",
        to_phase: pairs[0]?.to ?? "",
        title: "",
        is_required: false,
    });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState("");

    const canCreate = draft.from_phase && draft.to_phase && draft.title.trim().length > 0 && !isCreating && !!projectId;

    const handleCreate = async () => {
        if (!canCreate) return;
        const result = await createHandler({
            from_phase: draft.from_phase,
            to_phase: draft.to_phase,
            title: draft.title.trim(),
            is_required: draft.is_required,
        });
        if (result) {
            setDraft((prev) => ({ ...prev, title: "" }));
            refetch();
        }
    };

    const handleSaveEdit = async (id: string) => {
        if (!editTitle.trim()) return;
        const result = await updateHandler(id, { title: editTitle.trim() });
        if (result) {
            setEditingId(null);
            setEditTitle("");
            refetch();
        }
    };

    const handleDelete = async (id: string) => {
        const ok = await deleteHandler(id);
        if (ok) refetch();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{t("Manage Handoff Criteria")}</DialogTitle>
                </DialogHeader>

                {!projectId && (
                    <p className="text-sm text-text-muted text-center py-2">{t("Select a project first to manage criteria.")}</p>
                )}

                {projectId && (
                    <>
                        <div className="rounded-lg border border-border bg-card p-3 mb-4 space-y-2">
                            <p className="text-xs font-semibold text-text-dark">{t("Add new criteria")}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2">
                                <div>
                                    <Label className="text-[10px]">{t("Transition")}</Label>
                                    <Select
                                        value={`${draft.from_phase}|${draft.to_phase}`}
                                        onValueChange={(v) => {
                                            const [from, to] = v.split("|");
                                            setDraft((p) => ({ ...p, from_phase: from ?? "", to_phase: to ?? "" }));
                                        }}
                                    >
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {pairs.map((pair) => (
                                                <SelectItem key={`${pair.from}|${pair.to}`} value={`${pair.from}|${pair.to}`}>
                                                    {pair.from} → {pair.to}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-end gap-2">
                                    <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={draft.is_required}
                                            onChange={(e) => setDraft((p) => ({ ...p, is_required: e.target.checked }))}
                                        />
                                        {t("Required")}
                                    </label>
                                </div>
                            </div>
                            <div className="flex items-end gap-2">
                                <div className="flex-1">
                                    <Label className="text-[10px]" htmlFor="criteria-title">{t("Title")}</Label>
                                    <Input
                                        id="criteria-title"
                                        value={draft.title}
                                        onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))}
                                        placeholder={t("e.g. Figma designs finalized and approved")}
                                    />
                                </div>
                                <Button size="sm" className="gap-1.5" disabled={!canCreate} onClick={handleCreate}>
                                    <Plus className="h-3.5 w-3.5" />
                                    {t("Add")}
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-xs font-semibold text-text-dark">{t("Existing criteria")}</p>
                            {isLoading && criteria.length === 0 ? (
                                <p className="text-xs text-text-muted text-center py-4">{t("Loading...")}</p>
                            ) : criteria.length === 0 ? (
                                <p className="text-xs text-text-muted text-center py-4">{t("No criteria defined yet.")}</p>
                            ) : (
                                <div className="flex flex-col gap-1.5 max-h-[40vh] overflow-y-auto">
                                    {criteria.map((c) => (
                                        <div key={c.id} className={cn("flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2")}>
                                            {c.is_required && (
                                                <Badge variant="error" className="text-[10px] shrink-0">{t("Required")}</Badge>
                                            )}
                                            <span className="text-[11px] text-text-muted whitespace-nowrap shrink-0">
                                                {c.from_phase} → {c.to_phase}
                                            </span>
                                            {editingId === c.id ? (
                                                <>
                                                    <Input
                                                        value={editTitle}
                                                        onChange={(e) => setEditTitle(e.target.value)}
                                                        className="flex-1"
                                                    />
                                                    <Button size="sm" onClick={() => handleSaveEdit(c.id)} disabled={isUpdating || !editTitle.trim()}>
                                                        {t("Save")}
                                                    </Button>
                                                    <Button size="sm" variant="outline" onClick={() => { setEditingId(null); setEditTitle(""); }}>
                                                        {t("Cancel")}
                                                    </Button>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="flex-1 text-sm text-text-dark truncate" title={c.title}>{c.title}</span>
                                                    <Button size="sm" variant="outline" onClick={() => { setEditingId(c.id); setEditTitle(c.title); }}>
                                                        {t("Edit")}
                                                    </Button>
                                                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleDelete(c.id)} disabled={isDeleting}>
                                                        <Trash2 className="h-4 w-4 text-error" />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}

                <div className="flex justify-end gap-2 mt-4">
                    <DialogClose asChild>
                        <Button variant="outline">{t("Close")}</Button>
                    </DialogClose>
                </div>
            </DialogContent>
        </Dialog>
    );
};
