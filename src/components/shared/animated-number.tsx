import { useCountUp } from "@/hooks";
import { cn } from "@/utils";

interface AnimatedNumberProps {
    value: number;
    className?: string;
    suffix?: string;
    prefix?: string;
    decimals?: number;
}

export const AnimatedNumber = ({ value, className, suffix, prefix, decimals = 0 }: AnimatedNumberProps) => {
    const animated = useCountUp(value);
    const display = decimals > 0 ? (animated + (value % 1)).toFixed(decimals) : animated;

    return (
        <span className={cn("tabular-nums", className)}>
            {prefix}{display}{suffix}
        </span>
    );
};
