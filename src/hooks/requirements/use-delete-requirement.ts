import { requirementsConstants } from "@/constants/requirements";
import { requirementsService } from "@/services";

import { useMutationAction } from "../shared";

export const useDeleteRequirement = () => {
    const { mutate, isLoading } = useMutationAction(
        async (id: string): Promise<true> => {
            await requirementsService.deleteHandler(id);
            return true;
        },
        {
            successMessage: requirementsConstants.messages.deleteSuccess,
            errorFallback: requirementsConstants.errors.deleteFailed,
            context: "requirements.delete",
        },
    );

    return { deleteHandler: mutate, isLoading };
};
