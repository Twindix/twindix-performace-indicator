import { useState } from "react";

import { blockersConstants } from "@/constants";
import type {
    BlockerFormStateInterface,
    BlockerInterface,
    UseBlockerFormArgsInterface,
    UseBlockerFormReturnInterface,
} from "@/interfaces";

import { useCreateBlocker } from "./use-create-blocker";
import { useUpdateBlocker } from "./use-update-blocker";

export const useBlockerForm = ({ sprintId, onSaved }: UseBlockerFormArgsInterface): UseBlockerFormReturnInterface => {
    const [isOpen, setIsOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<BlockerInterface | null>(null);
    const [value, setValue] = useState<BlockerFormStateInterface>(blockersConstants.defaults.emptyForm);
    const { createHandler, isLoading: isCreating } = useCreateBlocker();
    const { updateHandler, isLoading: isUpdating } = useUpdateBlocker();

    const isEdit = Boolean(editTarget);
    const isSubmitting = isCreating || isUpdating;

    const openAdd = () => {
        setValue(blockersConstants.defaults.emptyForm);
        setEditTarget(null);
        setIsOpen(true);
    };

    const openEdit = (blocker: BlockerInterface) => {
        setValue({
            title: blocker.title,
            description: blocker.description ?? "",
            severity: blocker.severity,
            type: blocker.type,
            ownedBy: blocker.owner?.id ?? "",
        });
        setEditTarget(blocker);
        setIsOpen(true);
    };

    const close = () => {
        setIsOpen(false);
        setEditTarget(null);
    };

    const onSubmit = async () => {
        if (!value.title.trim() || !value.ownedBy || !value.severity || !value.type) return;
        const payload = {
            title: value.title.trim(),
            description: value.description.trim() || undefined,
            severity: value.severity,
            type: value.type,
            owned_by: value.ownedBy,
        };
        let result: BlockerInterface | null;
        if (isEdit && editTarget) {
            result = await updateHandler(editTarget.id, payload);
        } else {
            if (!sprintId) return;
            result = await createHandler(sprintId, payload);
        }
        if (result) {
            onSaved(result);
            close();
        }
    };

    return {
        isOpen,
        isEdit,
        isSubmitting,
        value,
        onChange: setValue,
        openAdd,
        openEdit,
        close,
        onSubmit,
    };
};
