import { useEffect, useRef, useState } from "react";

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export const useCountUp = (target: number, duration = 800): number => {
    const [value, setValue] = useState(0);
    const rafRef = useRef<number>(0);
    const prevTarget = useRef(target);

    useEffect(() => {
        const from = prevTarget.current !== target ? 0 : value;
        prevTarget.current = target;
        const start = performance.now();

        const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = easeOutCubic(progress);
            setValue(Math.round(from + (target - from) * eased));

            if (progress < 1) {
                rafRef.current = requestAnimationFrame(animate);
            }
        };

        rafRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(rafRef.current);
    }, [target, duration]); // eslint-disable-line react-hooks/exhaustive-deps

    return value;
};
