import { useState } from "react";

import { useTaskTags } from "@/hooks";
import type {
    UseTaskTagsFormArgsInterface,
    UseTaskTagsFormReturnInterface,
} from "@/interfaces";

export const useTaskTagsForm = ({
    task,
    patchTaskLocal,
}: UseTaskTagsFormArgsInterface): UseTaskTagsFormReturnInterface => {
    const { addHandler, removeHandler } = useTaskTags();
    const [tagInput, setTagInput] = useState("");
    const [showTagInput, setShowTagInput] = useState(false);

    const handleAddTag = async () => {
        const v = tagInput.trim();
        if (!v) return;
        const snapshot = task.tags;
        patchTaskLocal(task.id, { tags: [...snapshot, v] });
        setTagInput("");
        setShowTagInput(false);
        const ok = await addHandler(task.id, v);
        if (!ok) patchTaskLocal(task.id, { tags: snapshot });
    };

    const handleRemoveTag = async (tagId: string) => {
        const snapshot = task.tags;
        patchTaskLocal(task.id, {
            tags: snapshot.filter((t) => (typeof t === "string" ? t : t.id) !== tagId),
        });
        const ok = await removeHandler(task.id, tagId);
        if (!ok) patchTaskLocal(task.id, { tags: snapshot });
    };

    return { tagInput, setTagInput, showTagInput, setShowTagInput, handleAddTag, handleRemoveTag };
};
