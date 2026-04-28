import { useState } from "react";

import type {
    EditSprintFormStateInterface,
    UseEditSprintFormArgsInterface,
    UseEditSprintFormReturnInterface,
} from "@/interfaces";

import { useUpdateSprint } from "./use-update-sprint";

const emptyForm: EditSprintFormStateInterface = { name: "", start_date: "", end_date: "" };

export const useEditSprintForm = ({
    activeSprint,
    onSaved,
}: UseEditSprintFormArgsInterface): UseEditSprintFormReturnInterface => {
    const [isOpen, setIsOpen] = useState(false);
    const [value, setValue] = useState<EditSprintFormStateInterface>(emptyForm);
    const { updateHandler, isLoading: isSaving } = useUpdateSprint();

    const open = () => {
        if (!activeSprint) return;
        setValue({
            name: activeSprint.name,
            start_date: activeSprint.start_date,
            end_date: activeSprint.end_date,
        });
        setIsOpen(true);
    };

    const close = () => setIsOpen(false);

    const onSave = async () => {
        if (!activeSprint || !value.name.trim()) return;
        const res = await updateHandler(activeSprint.id, {
            name: value.name.trim(),
            start_date: value.start_date,
            end_date: value.end_date,
        });
        if (res) {
            await onSaved();
            setIsOpen(false);
        }
    };

    return {
        isOpen,
        isSaving,
        value,
        onChange: setValue,
        open,
        close,
        onSave,
    };
};
