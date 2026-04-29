import { Card, CardContent } from "@/atoms";
import { AnimatedNumber } from "@/components/shared";
import type { MetricBoxPropsInterface } from "@/interfaces";

export const MetricBox = ({ label, value, suffix }: MetricBoxPropsInterface) => (
    <Card>
        <CardContent className="p-3">
            <p className="text-xs text-text-muted mb-1">{label}</p>
            <p className="text-xl font-semibold text-text-dark">
                <AnimatedNumber value={Math.round(value * 10) / 10} suffix={suffix} />
            </p>
        </CardContent>
    </Card>
);
