import { useMemo, useState } from "react";
import { X } from "lucide-react";

import { Input } from "@/atoms";
import { t } from "@/hooks";
import type { TaskAutocompletePropsInterface } from "@/interfaces";

export const TaskAutocomplete = ({ tasks, value, onChange, placeholder }: TaskAutocompletePropsInterface) => {
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const selected = tasks.find((task) => task.id === value) ?? null;
    const effectiveQuery = selected ? selected.title : query;
    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return tasks.filter((task) => !q || task.title.toLowerCase().includes(q)).slice(0, 8);
    }, [tasks, query]);

    return (
        <div className="relative">
            <div className="flex items-center gap-2">
                <Input
                    placeholder={placeholder ?? t("Search tasks...")}
                    value={effectiveQuery}
                    onChange={(e) => { setQuery(e.target.value); if (selected) onChange(""); setOpen(true); }}
                    onFocus={() => setOpen(true)}
                    onBlur={() => setTimeout(() => setOpen(false), 120)}
                />
                {selected && (
                    <button
                        type="button"
                        onClick={() => { onChange(""); setQuery(""); }}
                        className="p-1.5 rounded-md text-text-muted hover:text-error hover:bg-muted shrink-0"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>
            {open && filtered.length > 0 && (
                <div className="absolute z-20 left-0 right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-auto">
                    {filtered.map((task) => (
                        <button
                            key={task.id}
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => { onChange(task.id); setQuery(""); setOpen(false); }}
                            className={`w-full px-3 py-2 text-left text-sm hover:bg-muted cursor-pointer ${task.id === value ? "bg-muted" : ""}`}
                        >
                            {task.title}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
