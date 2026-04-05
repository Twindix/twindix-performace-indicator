import { useEffect, useRef, useState } from "react";

import { cn } from "@/utils";

interface ScoreGaugeProps {
    score: number;
    size?: "sm" | "md" | "lg";
    label?: string;
}

const getColor = (score: number): string => {
    if (score >= 80) return "var(--raw-success)";
    if (score >= 60) return "var(--raw-warning)";
    return "var(--raw-error)";
};

const sizes = {
    sm: { container: "h-20 w-20", text: "text-lg", label: "text-[9px]", inner: "h-14 w-14" },
    md: { container: "h-32 w-32", text: "text-3xl", label: "text-xs", inner: "h-24 w-24" },
    lg: { container: "h-44 w-44", text: "text-5xl", label: "text-sm", inner: "h-36 w-36" },
};

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export const ScoreGauge = ({ score, size = "md", label }: ScoreGaugeProps) => {
    const color = getColor(score);
    const s = sizes[size];
    const [animatedScore, setAnimatedScore] = useState(0);
    const [animatedAngle, setAnimatedAngle] = useState(0);
    const rafRef = useRef<number>(0);

    useEffect(() => {
        const targetAngle = (score / 100) * 360;
        const duration = 1000;
        const start = performance.now();

        const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = easeOutCubic(progress);

            setAnimatedAngle(eased * targetAngle);
            setAnimatedScore(Math.round(eased * score));

            if (progress < 1) {
                rafRef.current = requestAnimationFrame(animate);
            }
        };

        rafRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(rafRef.current);
    }, [score]);

    return (
        <div
            className={cn("relative flex items-center justify-center rounded-full transition-shadow", s.container)}
            style={{ background: `conic-gradient(${color} ${animatedAngle}deg, var(--raw-border) ${animatedAngle}deg)` }}
        >
            <div className={cn("absolute rounded-full bg-card flex flex-col items-center justify-center", s.inner)}>
                <span className={cn("font-bold text-text-dark tabular-nums", s.text)}>{animatedScore}</span>
                {label && <span className={cn("text-text-muted font-medium", s.label)}>{label}</span>}
            </div>
        </div>
    );
};
