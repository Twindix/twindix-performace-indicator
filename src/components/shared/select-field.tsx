import type { SelectFieldPropsInterface } from "@/interfaces";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui";

export const SelectField = ({
    value,
    onChange,
    options,
    placeholder,
    triggerClassName,
    id,
}: SelectFieldPropsInterface) => (
    <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id} className={triggerClassName}>
            <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
            {options.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
        </SelectContent>
    </Select>
);
