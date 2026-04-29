import { useMemo, useState } from "react";
import { X } from "lucide-react";

import { Input } from "@/atoms";
import { t } from "@/hooks";
import type { UsersAutocompletePropsInterface } from "@/interfaces";

export const UsersAutocomplete = ({ members, values, onChange, placeholder }: UsersAutocompletePropsInterface) => {
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const selected = members.filter((m) => values.includes(m.id));
    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return members.filter((m) =>
            !values.includes(m.id) && (!q || m.full_name.toLowerCase().includes(q) || (m.email ?? "").toLowerCase().includes(q)),
        ).slice(0, 8);
    }, [members, values, query]);

    const addUser = (id: string) => { onChange([...values, id]); setQuery(""); };
    const removeUser = (id: string) => onChange(values.filter((v) => v !== id));

    return (
        <div className="flex flex-col gap-2">
            {selected.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {selected.map((m) => (
                        <span key={m.id} className="flex items-center gap-1 text-xs font-medium bg-primary/10 text-primary rounded-full pl-2 pr-1 py-0.5">
                            {m.full_name}
                            <button type="button" onClick={() => removeUser(m.id)} className="hover:text-error transition-colors">
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    ))}
                </div>
            )}
            <div className="relative">
                <Input
                    placeholder={placeholder ?? t("Search users...")}
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
                    onFocus={() => setOpen(true)}
                    onBlur={() => setTimeout(() => setOpen(false), 120)}
                />
                {open && filtered.length > 0 && (
                    <div className="absolute z-20 left-0 right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-auto">
                        {filtered.map((m) => (
                            <button
                                key={m.id}
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => addUser(m.id)}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-muted cursor-pointer flex items-center gap-2"
                            >
                                <span className="text-xs font-medium bg-muted rounded-full h-5 w-5 flex items-center justify-center shrink-0">
                                    {m.avatar_initials}
                                </span>
                                <span className="flex-1 truncate">{m.full_name}</span>
                                {m.email && <span className="text-xs text-text-muted truncate">{m.email}</span>}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
