import { AnimatedNumber } from "@/components/shared";
import type { StatPropsInterface } from "@/interfaces/users";
import { cn } from "@/utils";

export const Stat = ({ label, value, suffix = "", color = "text-text-dark" }: StatPropsInterface) => (
    <div className="flex flex-col gap-0.5">
        <p className={cn("text-2xl font-bold", color)}><AnimatedNumber value={value} suffix={suffix} /></p>
        <p className="text-xs text-text-muted">{label}</p>
    </div>
);
