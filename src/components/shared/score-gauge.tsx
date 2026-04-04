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
    sm: { container: "h-20 w-20", text: "text-lg", label: "text-[9px]" },
    md: { container: "h-32 w-32", text: "text-3xl", label: "text-xs" },
    lg: { container: "h-44 w-44", text: "text-5xl", label: "text-sm" },
};

export const ScoreGauge = ({ score, size = "md", label }: ScoreGaugeProps) => {
    const color = getColor(score);
    const s = sizes[size];
    const angle = (score / 100) * 360;

    return (
        <div className={cn("relative flex items-center justify-center rounded-full", s.container)} style={{ background: `conic-gradient(${color} ${angle}deg, var(--raw-border) ${angle}deg)` }}>
            <div className={cn("absolute rounded-full bg-card flex flex-col items-center justify-center", size === "sm" ? "h-14 w-14" : size === "md" ? "h-24 w-24" : "h-36 w-36")}>
                <span className={cn("font-bold text-text-dark", s.text)}>{score}</span>
                {label && <span className={cn("text-text-muted font-medium", s.label)}>{label}</span>}
            </div>
        </div>
    );
};
