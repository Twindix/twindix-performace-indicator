import { X } from "lucide-react";

import type { SelectedUserChipsPropsInterface } from "@/interfaces";

export const SelectedUserChips = ({ users, onRemove }: SelectedUserChipsPropsInterface) => {
    if (users.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-1.5">
            {users.map((u) => (
                <span
                    key={u.id}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium"
                >
                    <span>{u.full_name}</span>
                    <button
                        type="button"
                        onClick={() => onRemove(u.id)}
                        className="hover:text-error transition-colors cursor-pointer"
                    >
                        <X className="h-3 w-3" />
                    </button>
                </span>
            ))}
        </div>
    );
};
