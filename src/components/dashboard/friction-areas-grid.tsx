import { frictionAreaConfig } from "@/constants";
import type { FrictionAreasGridPropsInterface } from "@/interfaces";
import { cn } from "@/utils";

import { FrictionAreaCard } from "./friction-area-card";

export const FrictionAreasGrid = ({ subScores, compact }: FrictionAreasGridPropsInterface) => (
    <div className={cn("lg:col-span-2 grid grid-cols-2 stagger-children", compact ? "gap-2" : "gap-3")}>
        {frictionAreaConfig.map((config) => (
            <FrictionAreaCard
                key={config.key}
                config={config}
                score={subScores[config.key]?.score ?? 0}
                compact={compact}
            />
        ))}
    </div>
);
