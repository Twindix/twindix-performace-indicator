import { StatCard } from "@/atoms";
import { Card, CardContent } from "@/atoms";
import type { StatsGridPropsInterface } from "@/interfaces";
import { cn } from "@/utils";

import { AnimatedNumber } from "./animated-number";

export const StatsGrid = ({ items, compact }: StatsGridPropsInterface) => (
    <div className={cn("grid grid-cols-2 sm:grid-cols-4", compact ? "gap-2 mb-3" : "gap-4 mb-6")}>
        {items.map((item) =>
            item.icon ? (
                <StatCard
                    key={item.label}
                    icon={item.icon}
                    value={item.value}
                    label={item.label}
                    iconWrapperClassName={item.iconWrapperClassName}
                    iconClassName={item.iconClassName}
                    valueClassName={item.valueClassName}
                />
            ) : (
                <Card key={item.label}>
                    <CardContent className="p-3 sm:p-4 text-center">
                        <p className={cn("text-2xl sm:text-3xl font-bold", item.valueClassName ?? "text-text-dark")}>
                            <AnimatedNumber value={item.value} suffix={item.suffix} />
                        </p>
                        <p className="text-[10px] sm:text-xs text-text-muted mt-1">{item.label}</p>
                    </CardContent>
                </Card>
            )
        )}
    </div>
);
