import { cn } from "@/utils";
import { LogoSizeEnum } from "@/enums";

const sizeClasses: Record<LogoSizeEnum, string> = {
    [LogoSizeEnum.SM]: "text-base gap-1.5",
    [LogoSizeEnum.MD]: "text-xl gap-2",
    [LogoSizeEnum.LG]: "text-3xl gap-3",
};

const iconSizeClasses: Record<LogoSizeEnum, string> = {
    [LogoSizeEnum.SM]: "h-5 w-5",
    [LogoSizeEnum.MD]: "h-7 w-7",
    [LogoSizeEnum.LG]: "h-10 w-10",
};

interface LogoProps {
    size?: LogoSizeEnum;
    className?: string;
}

export const Logo = ({ size = LogoSizeEnum.MD, className }: LogoProps) => (
    <div className={cn("flex items-center font-bold text-primary", sizeClasses[size], className)}>
        <div className={cn("rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-black shrink-0", iconSizeClasses[size])}>
            T
        </div>
        <span>Twindix</span>
    </div>
);
