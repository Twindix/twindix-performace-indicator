import { useState } from "react";

import { blockersConstants } from "@/constants";
import { t } from "@/hooks";
import type {
    BlockerInterface,
    UseBlockerDetailArgsInterface,
    UseBlockerDetailReturnInterface,
} from "@/interfaces";

import { useDeleteBlocker } from "./use-delete-blocker";
import { useEscalateBlocker } from "./use-escalate-blocker";
import { useGetBlocker } from "./use-get-blocker";
import { useResolveBlocker } from "./use-resolve-blocker";

export const useBlockerDetail = ({
    onPatch,
    onDelete,
    refetchAnalytics,
}: UseBlockerDetailArgsInterface): UseBlockerDetailReturnInterface => {
    const [isOpen, setIsOpen] = useState(false);
    const [current, setCurrent] = useState<BlockerInterface | null>(null);

    const { getHandler } = useGetBlocker();
    const { resolveHandler, isLoading: isResolving } = useResolveBlocker();
    const { escalateHandler, isLoading: isEscalating } = useEscalateBlocker();
    const { deleteHandler, isLoading: isDeleting } = useDeleteBlocker();

    const open = (blocker: BlockerInterface) => {
        setCurrent(blocker);
        setIsOpen(true);
        getHandler(blocker.id).then((res) => {
            if (res) {
                setCurrent(res);
                onPatch(res);
            }
        });
    };

    const close = () => setIsOpen(false);

    const onResolve = async () => {
        if (!current) return;
        const res = await resolveHandler(current.id);
        if (res) {
            setCurrent(res);
            onPatch(res);
            refetchAnalytics();
        }
    };

    const onEscalate = async () => {
        if (!current) return;
        const res = await escalateHandler(current.id);
        if (res) {
            setCurrent(res);
            onPatch(res);
            refetchAnalytics();
        }
    };

    const onDeleteHandler = async () => {
        if (!current) return;
        if (!confirm(t(blockersConstants.deleteConfirmMessage))) return;
        const ok = await deleteHandler(current.id);
        if (ok) {
            onDelete(current.id);
            refetchAnalytics();
            setIsOpen(false);
        }
    };

    return {
        isOpen,
        current,
        isResolving,
        isEscalating,
        isDeleting,
        open,
        close,
        onResolve,
        onEscalate,
        onDelete: onDeleteHandler,
    };
};
