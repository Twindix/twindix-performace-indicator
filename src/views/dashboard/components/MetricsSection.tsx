import { metricsTilesConfig } from "@/constants";
import { t } from "@/hooks";
import type { MetricsSectionPropsInterface } from "@/interfaces";
import { cn } from "@/utils";

import { MetricBox } from "./MetricBox";

export const MetricsSection = ({ metrics, compact }: MetricsSectionPropsInterface) => (
    <div className={compact ? "mb-3" : "mb-6"}>
        <h2 className={cn("font-semibold text-text-dark", compact ? "text-base mb-2" : "text-lg mb-3")}>
            {t("Performance Metrics")}
        </h2>
        <div className={cn("grid grid-cols-2 lg:grid-cols-4 stagger-children", compact ? "gap-2" : "gap-3")}>
            {metricsTilesConfig.map((tile) => (
                <MetricBox
                    key={tile.field}
                    label={t(tile.labelKey)}
                    value={metrics[tile.field]}
                    suffix={tile.suffix}
                />
            ))}
        </div>
    </div>
);
