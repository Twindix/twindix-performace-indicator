import { useCallback } from "react";

import { remindersConstants } from "@/constants";
import type { ReminderInterface, RemindersListFiltersInterface } from "@/interfaces";
import { remindersService } from "@/services";

import { usePaginatedQuery } from "../shared";

export const useRemindersList = (filters?: RemindersListFiltersInterface) => {
    const { status, urgency, search, project_id, sort } = filters ?? {};
    const { items, meta, page, perPage, isLoading, setPage, setPerPage, refetch, setItems } = usePaginatedQuery<ReminderInterface>(
        ({ page, per_page }) => remindersService.listHandler({ status, urgency, search, project_id, sort, page, per_page }),
        [status, urgency, search, project_id, sort],
        {
            errorFallback: remindersConstants.errors.fetchFailed,
            context: "reminders.list",
        },
    );

    const prependReminderLocal = useCallback((reminder: ReminderInterface) => {
        setItems((prev) => [reminder, ...prev]);
    }, [setItems]);

    const patchReminderLocal = useCallback((reminder: ReminderInterface) => {
        setItems((prev) => prev.map((r) => (r.id === reminder.id ? reminder : r)));
    }, [setItems]);

    const removeReminderLocal = useCallback((id: string) => {
        setItems((prev) => prev.filter((r) => r.id !== id));
    }, [setItems]);

    return { items, meta, page, perPage, isLoading, setPage, setPerPage, refetch, prependReminderLocal, patchReminderLocal, removeReminderLocal };
};
