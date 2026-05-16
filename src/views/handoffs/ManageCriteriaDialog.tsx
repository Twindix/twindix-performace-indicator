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
import type { HandoffCriteriaType } from "@/interfaces";
import {
    Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle,
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/ui";
import { cn } from "@/utils";

interface ManageCriteriaDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    phases: string[];
}

const phasePairsFrom = (phases: string[]): { from: string; to: string }[] => {
    const out: { from: string; to: string }[] = [];
    for (let i = 0; i < phases.length - 1; i++) {
        out.push({ from: phases[i], to: phases[i + 1] });
    }
    return out;
};

export const ManageCriteriaDialog = ({ open, onOpenChange, phases }: ManageCriteriaDialogProps) => {
    const { criteria, isLoading, refetch } = useHandoffsCriteria();
    const { createHandler, isLoading: isCreating } = useCreateHandoffCriteria();
    const { updateHandler, isLoading: isUpdating } = useUpdateHandoffCriteria();
    const { deleteHandler, isLoading: isDeleting } = useDeleteHandoffCriteria();

    const pairs = phasePairsFrom(phases.length > 1 ? phases : ["Product", "Design", "Development", "Code Review", "QA", "Done"]);

    const [draft, setDraft] = useState({
        from_phase: pairs[0]?.from ?? "",
        to_phase: pairs[0]?.to ?? "",
        criteria_type: "entry" as HandoffCriteriaType,
        label: "",
    });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editLabel, setEditLabel] = useState("");

    const canCreate = draft.from_phase && draft.to_phase && draft.label.trim().length > 0 && !isCreating;

    const handleCreate = async () => {
        if (!canCreate) return;
        const result = await createHandler({
            from_phase: draft.from_phase,
            to_phase: draft.to_phase,
            criteria_type: draft.criteria_type,
            label: draft.label.trim(),
            is_default: true,
        });
        if (result) {
            setDraft((prev) => ({ ...prev, label: "" }));
            refetch();
        }
    };

    const handleStartEdit = (id: string, currentLabel: string) => {
        setEditingId(id);
        setEditLabel(currentLabel);
    };

    const handleSaveEdit = async (id: string) => {
        if (!editLabel.trim()) return;
        const result = await updateHandler(id, { label: editLabel.trim() });
        if (result) {
            setEditingId(null);
            setEditLabel("");
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

                {/* Create form */}
                <div className="rounded-lg border border-border bg-card p-3 mb-4 space-y-2">
                    <p className="text-xs font-semibold text-text-dark">{t("Add new criteria")}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2">
                        <div>
                            <Label className="text-[10px]">{t("Transition")}</Label>
                            <Select
                                value={`${draft.from_phase}|${draft.to_phase}`}
                                onValueChange={(v) => {
                                    const [from, to] = v.split("|");
                                    setDraft((p) => ({ ...p, from_phase: from, to_phase: to }));
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
                        <div>
                            <Label className="text-[10px]">{t("Type")}</Label>
                            <Select value={draft.criteria_type} onValueChange={(v) => setDraft((p) => ({ ...p, criteria_type: v as HandoffCriteriaType }))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="entry">{t("Entry")}</SelectItem>
                                    <SelectItem value="exit">{t("Exit")}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-end" />
                    </div>
                    <div className="flex items-end gap-2">
                        <div className="flex-1">
                            <Label className="text-[10px]" htmlFor="criteria-label">{t("Label")}</Label>
                            <Input
                                id="criteria-label"
                                value={draft.label}
                                onChange={(e) => setDraft((p) => ({ ...p, label: e.target.value }))}
                                placeholder={t("e.g. Figma designs finalized and approved")}
                            />
                        </div>
                        <Button size="sm" className="gap-1.5" disabled={!canCreate} onClick={handleCreate}>
                            <Plus className="h-3.5 w-3.5" />
                            {t("Add")}
                        </Button>
                    </div>
                </div>

                {/* List */}
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
                                    <Badge variant={c.criteria_type === "entry" ? "default" : "secondary"} className="text-[10px] shrink-0">
                                        {t(c.criteria_type)}
                                    </Badge>
                                    <span className="text-[11px] text-text-muted whitespace-nowrap shrink-0">
                                        {c.from_phase} → {c.to_phase}
                                    </span>
                                    {editingId === c.id ? (
                                        <>
                                            <Input
                                                value={editLabel}
                                                onChange={(e) => setEditLabel(e.target.value)}
                                                className="flex-1"
                                            />
                                            <Button size="sm" onClick={() => handleSaveEdit(c.id)} disabled={isUpdating || !editLabel.trim()}>
                                                {t("Save")}
                                            </Button>
                                            <Button size="sm" variant="outline" onClick={() => { setEditingId(null); setEditLabel(""); }}>
                                                {t("Cancel")}
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <span className="flex-1 text-sm text-text-dark truncate" title={c.label}>{c.label}</span>
                                            <Button size="sm" variant="outline" onClick={() => handleStartEdit(c.id, c.label)}>
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

                <div className="flex justify-end gap-2 mt-4">
                    <DialogClose asChild>
                        <Button variant="outline">{t("Close")}</Button>
                    </DialogClose>
                </div>
            </DialogContent>
        </Dialog>
    );
};
