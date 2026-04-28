import { useUserMultiSelect } from "@/hooks";
import type { UserMultiSelectPropsInterface } from "@/interfaces";

import { SelectedUserChips } from "./selected-user-chips";
import { UserOptionList } from "./user-option-list";
import { UserSearchInput } from "./user-search-input";

export const UserMultiSelect = ({ users, selected, onChange }: UserMultiSelectPropsInterface) => {
    const { search, setSearch, filtered, selectedUsers, toggle } = useUserMultiSelect({
        users,
        selected,
        onChange,
    });

    return (
        <div className="space-y-2">
            <SelectedUserChips users={selectedUsers} onRemove={toggle} />
            <UserSearchInput value={search} onChange={setSearch} />
            <UserOptionList users={filtered} selected={selected} onToggle={toggle} />
        </div>
    );
};
