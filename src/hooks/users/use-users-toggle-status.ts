import { useCallback } from "react";
import { toast } from "sonner";

import { usersConstants } from "@/constants";
import type { UserInterface } from "@/interfaces";
import type { UseUsersToggleStatusReturnInterface } from "@/interfaces/users";

import { t } from "../shared";

import { useUsersUpdate } from "./use-users-update";

export const useUsersToggleStatus = (
    patchUserLocal: (user: UserInterface) => void,
): UseUsersToggleStatusReturnInterface => {
    const { update } = useUsersUpdate();

    const toggleStatus = useCallback(async (user: UserInterface) => {
        const isInactive = user.account_status === "inactive";
        const next = isInactive ? "active" : "inactive";

        const optimistic: UserInterface = { ...user, account_status: next };
        patchUserLocal(optimistic);

        const res = await update(user.id, { account_status: next });

        if (res) {
            patchUserLocal(res);
            toast.success(t(isInactive ? usersConstants.messages.activated : usersConstants.messages.deactivated));
        } else {
            patchUserLocal(user);
        }
    }, [patchUserLocal, update]);

    return { toggleStatus };
};
