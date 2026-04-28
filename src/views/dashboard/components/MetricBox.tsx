import { Card, CardContent } from "@/atoms";
import type { MetricBoxPropsInterface } from "@/interfaces";

import { AnimNum } from "./AnimNum";

export const MetricBox = ({ label, value, suffix }: MetricBoxPropsInterface) => (
    <Card>
        <CardContent className="p-3">
            <p className="text-xs text-text-muted mb-1">{label}</p>
            <p className="text-xl font-semibold text-text-dark">
                <AnimNum value={Math.round(value * 10) / 10} />{suffix}
            </p>
        </CardContent>
    </Card>
);
