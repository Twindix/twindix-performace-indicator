import { useUserMultiSelect } from "@/hooks";
import type { UserMultiSelectPropsInterface } from "@/interfaces";

import { SelectedUserChips } from "./selected-chips";
import { UserOptionList } from "./option-list";
import { UserSearchInput } from "./search-input";

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

export { SelectedUserChips } from "./selected-chips";
export { UserOptionList } from "./option-list";
export { UserSearchInput } from "./search-input";
