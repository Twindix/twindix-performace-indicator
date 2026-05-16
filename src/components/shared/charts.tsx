import type { ReactNode } from "react";
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    PolarAngleAxis,
    RadialBar,
    RadialBarChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import type {
    BreakdownSliceInterface,
    DualMetricPointInterface,
    MetricPointInterface,
} from "@/interfaces/analytics";

const AXIS_STYLE = { fill: "var(--color-text-muted)", fontSize: 11 };
const TOOLTIP_STYLE = {
    backgroundColor: "var(--color-surface-elevated)",
    border: "1px solid var(--color-border)",
    borderRadius: 8,
    color: "var(--color-text-dark)",
    fontSize: 12,
};

interface ChartCardProps {
    title: string;
    subtitle?: string;
    height?: number;
    children: ReactNode;
    actions?: ReactNode;
}

export const ChartCard = ({ title, subtitle, height = 220, children, actions }: ChartCardProps) => (
    <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-start justify-between mb-3">
            <div>
                <h3 className="text-sm font-semibold text-text-dark">{title}</h3>
                {subtitle && <p className="text-[11px] text-text-muted">{subtitle}</p>}
            </div>
            {actions}
        </div>
        <div style={{ width: "100%", height }}>{children}</div>
    </div>
);

interface AreaTrendProps {
    data: MetricPointInterface[];
    color?: string;
    valueLabel?: string;
}

export const AreaTrend = ({ data, color = "var(--color-primary-medium)", valueLabel = "Value" }: AreaTrendProps) => (
    <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <defs>
                <linearGradient id="areaTrendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="label" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
            <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ stroke: color, strokeOpacity: 0.2 }} />
            <Area type="monotone" dataKey="value" name={valueLabel} stroke={color} strokeWidth={2} fill="url(#areaTrendFill)" />
        </AreaChart>
    </ResponsiveContainer>
);

interface BurnChartProps {
    data: DualMetricPointInterface[];
}

export const BurnChart = ({ data }: BurnChartProps) => (
    <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="label" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
            <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 11, color: "var(--color-text-muted)" }} />
            <Line type="monotone" dataKey="planned" name="Planned" stroke="var(--color-muted-foreground)" strokeWidth={2} dot={false} strokeDasharray="4 4" />
            <Line type="monotone" dataKey="actual" name="Actual" stroke="var(--color-primary-medium)" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
    </ResponsiveContainer>
);

interface BarSeriesProps {
    data: MetricPointInterface[];
    color?: string;
    valueLabel?: string;
}

export const BarSeries = ({ data, color = "var(--color-primary-medium)", valueLabel = "Value" }: BarSeriesProps) => (
    <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="label" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
            <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: color, fillOpacity: 0.08 }} />
            <Bar dataKey="value" name={valueLabel} fill={color} radius={[6, 6, 0, 0]} />
        </BarChart>
    </ResponsiveContainer>
);

interface StackedBreakdownBarsProps {
    data: DualMetricPointInterface[];
    plannedLabel?: string;
    actualLabel?: string;
    plannedColor?: string;
    actualColor?: string;
}

export const StackedBreakdownBars = ({
    data,
    plannedLabel = "Planned",
    actualLabel = "Actual",
    plannedColor = "var(--color-muted-foreground)",
    actualColor = "var(--color-primary-medium)",
}: StackedBreakdownBarsProps) => (
    <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="label" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
            <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 11, color: "var(--color-text-muted)" }} />
            <Bar dataKey="planned" name={plannedLabel} fill={plannedColor} radius={[4, 4, 0, 0]} />
            <Bar dataKey="actual" name={actualLabel} fill={actualColor} radius={[4, 4, 0, 0]} />
        </BarChart>
    </ResponsiveContainer>
);

interface DonutBreakdownProps {
    data: BreakdownSliceInterface[];
    unit?: string;
}

export const DonutBreakdown = ({ data, unit }: DonutBreakdownProps) => (
    <ResponsiveContainer>
        <PieChart>
            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => (unit ? `${v} ${unit}` : String(v))} />
            <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius="55%"
                outerRadius="85%"
                paddingAngle={2}
                stroke="var(--color-surface-elevated)"
            >
                {data.map((slice) => (
                    <Cell key={slice.name} fill={slice.color} />
                ))}
            </Pie>
            <Legend wrapperStyle={{ fontSize: 11, color: "var(--color-text-muted)" }} />
        </PieChart>
    </ResponsiveContainer>
);

interface RadialProgressProps {
    value: number;
    label?: string;
    color?: string;
    max?: number;
}

export const RadialProgress = ({ value, label, color = "var(--color-primary-medium)", max = 100 }: RadialProgressProps) => {
    const data = [{ name: label ?? "value", value: Math.max(0, Math.min(max, value)) }];
    return (
        <ResponsiveContainer>
            <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="92%"
                barSize={14}
                data={data}
                startAngle={90}
                endAngle={-270}
            >
                <PolarAngleAxis type="number" domain={[0, max]} tick={false} />
                <RadialBar dataKey="value" fill={color} cornerRadius={10} background={{ fill: "var(--color-muted)" }} />
            </RadialBarChart>
        </ResponsiveContainer>
    );
};
