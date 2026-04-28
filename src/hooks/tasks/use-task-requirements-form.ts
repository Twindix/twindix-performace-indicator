import { useState } from "react";

import {
    useCreateRequirement,
    useDeleteRequirement,
    useToggleRequirement,
    useUpdateRequirement,
} from "@/hooks";
import type {
    RequirementInterface,
    UseTaskRequirementsFormArgsInterface,
    UseTaskRequirementsFormReturnInterface,
} from "@/interfaces";

export const useTaskRequirementsForm = ({
    task,
    patchTaskLocal,
}: UseTaskRequirementsFormArgsInterface): UseTaskRequirementsFormReturnInterface => {
    const { createHandler, isLoading: isAddingReq } = useCreateRequirement();
    const { toggleHandler } = useToggleRequirement();
    const { updateHandler } = useUpdateRequirement();
    const { deleteHandler } = useDeleteRequirement();

    const [reqInput, setReqInput] = useState("");
    const [showReqInput, setShowReqInput] = useState(false);
    const [editingReqId, setEditingReqId] = useState<string | null>(null);
    const [editingReqLabel, setEditingReqLabel] = useState("");

    const handleAdd = async () => {
        const v = reqInput.trim();
        if (!v) return;
        const res = await createHandler(task.id, { content: v });
        if (res) {
            const requirements = task.requirements ?? [];
            patchTaskLocal(task.id, { requirements: [...requirements, res as RequirementInterface] });
            setReqInput("");
            setShowReqInput(false);
        }
    };

    const handleSaveEdit = async (req: RequirementInterface) => {
        const v = editingReqLabel.trim();
        if (!v) return;
        const res = await updateHandler(req.id, { content: v });
        if (res) {
            const requirements = task.requirements ?? [];
            patchTaskLocal(task.id, {
                requirements: requirements.map((r) => (r.id === req.id ? { ...r, content: res.content } : r)),
            });
            setEditingReqId(null);
        }
    };

    const handleToggle = async (req: RequirementInterface) => {
        const requirements = task.requirements ?? [];
        const optimisticDone = !req.is_done;
        patchTaskLocal(task.id, {
            requirements: requirements.map((r) => (r.id === req.id ? { ...r, is_done: optimisticDone } : r)),
        });
        const res = await toggleHandler(req.id);
        if (res) {
            patchTaskLocal(task.id, {
                requirements: requirements.map((r) => (r.id === req.id ? { ...r, is_done: res.is_done } : r)),
            });
        } else {
            patchTaskLocal(task.id, {
                requirements: requirements.map((r) => (r.id === req.id ? { ...r, is_done: req.is_done } : r)),
            });
        }
    };

    const handleDelete = async (reqId: string) => {
        const ok = await deleteHandler(reqId);
        if (ok) {
            const requirements = task.requirements ?? [];
            patchTaskLocal(task.id, { requirements: requirements.filter((r) => r.id !== reqId) });
        }
    };

    return {
        reqInput,
        setReqInput,
        showReqInput,
        setShowReqInput,
        editingReqId,
        setEditingReqId,
        editingReqLabel,
        setEditingReqLabel,
        isAddingReq,
        handleAdd,
        handleSaveEdit,
        handleToggle,
        handleDelete,
    };
};
