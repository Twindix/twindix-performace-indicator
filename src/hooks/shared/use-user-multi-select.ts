import { useState } from "react";

import type {
    UseUserMultiSelectArgsInterface,
    UseUserMultiSelectReturnInterface,
} from "@/interfaces";

export const useUserMultiSelect = ({
    users,
    selected,
    onChange,
}: UseUserMultiSelectArgsInterface): UseUserMultiSelectReturnInterface => {
    const [search, setSearch] = useState("");

    const filtered = users.filter((u) =>
        u.full_name.toLowerCase().includes(search.toLowerCase()),
    );

    const selectedUsers = users.filter((u) => selected.includes(u.id));

    const toggle = (id: string) => {
        onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
    };

    return { search, setSearch, filtered, selectedUsers, toggle };
};
