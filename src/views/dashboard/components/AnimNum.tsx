import { useCountUp } from "@/hooks";
import type { AnimNumPropsInterface } from "@/interfaces";

export const AnimNum = ({ value, className }: AnimNumPropsInterface) => {
    const animated = useCountUp(value);
    return <span className={className}>{animated}</span>;
};
