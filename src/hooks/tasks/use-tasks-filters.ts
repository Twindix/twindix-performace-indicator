import { useEffect, useState } from "react";

import { tasksConstants } from "@/constants";
import type {
    TasksFiltersValuesInterface,
    UseTasksFiltersReturnInterface,
} from "@/interfaces";

export const useTasksFilters = (): UseTasksFiltersReturnInterface => {
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [values, setValues] = useState<TasksFiltersValuesInterface>(tasksConstants.defaultFilters);

    useEffect(() => {
        const id = setTimeout(() => setDebouncedSearch(search), tasksConstants.searchDebounceMs);
        return () => clearTimeout(id);
    }, [search]);

    const onChange = (key: keyof TasksFiltersValuesInterface, value: string) => {
        setValues((prev) => ({ ...prev, [key]: value }));
    };

    const onClear = () => {
        setSearch("");
        setValues(tasksConstants.defaultFilters);
    };

    const isAnyApplied =
        values.status !== "all" ||
        values.priority !== "all" ||
        values.assignee !== "all" ||
        values.type !== "all" ||
        search.length > 0;

    return { search, debouncedSearch, setSearch, values, onChange, onClear, isAnyApplied };
};
