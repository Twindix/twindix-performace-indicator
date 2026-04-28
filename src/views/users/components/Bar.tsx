import type { BarPropsInterface } from "@/interfaces/users";
import { cn } from "@/utils";

export const Bar = ({ value, max, color = "bg-primary" }: BarPropsInterface) => (
    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
            className={cn("h-full rounded-full transition-all duration-500", color)}
            style={{ width: `${Math.min(100, max > 0 ? (value / max) * 100 : 0)}%` }}
        />
    </div>
);
