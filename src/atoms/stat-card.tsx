import { AnimatedNumber } from "@/components/shared";
import type { StatCardPropsInterface } from "@/interfaces";
import { cn } from "@/utils";

import { Card, CardContent } from "./card";

export const StatCard = ({ icon: Icon, value, label, iconWrapperClassName, iconClassName, valueClassName }: StatCardPropsInterface) => (
    <Card>
        <CardContent className="p-4">
            <div className="flex items-center gap-3">
                <div className={cn("flex h-10 w-10 items-center justify-center rounded-full", iconWrapperClassName)}>
                    <Icon className={cn("h-5 w-5", iconClassName)} />
                </div>
                <div>
                    <p className={cn("text-2xl font-bold", valueClassName)}>
                        <AnimatedNumber value={value} />
                    </p>
                    <p className="text-xs text-text-muted">{label}</p>
                </div>
            </div>
        </CardContent>
    </Card>
);
