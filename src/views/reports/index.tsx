import { useEffect, useState } from "react";
import { Download, FileSpreadsheet, Lightbulb, Users } from "lucide-react";

import {
    Badge,
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/atoms";

import {
    AnimatedNumber,
    EmptyState,
    Header,
    ScoreGauge,
    StatusBadge,
} from "@/components/shared";

import {
    analyticsSeed,
    authorshipSeed,
    handoffsSeed,
    timeSeed,
    workloadSeed,
} from "@/data";

import { MetricStatus } from "@/enums";

import { t } from "@/hooks";

import type { BreakdownSliceInterface } from "@/interfaces";

import { cn, formatDate } from "@/utils";
import { MetricStatus } from "@/enums";

import {
    t,
    useExportReportSection,
    usePermissions,
    useProjectReport,
    useProjectsListLite,
} from "@/hooks";

import type {
    BreakdownSliceInterface,
    ReportExportFormat,
    ReportSectionKey,
} from "@/interfaces";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/ui";

import { cn, formatDate } from "@/utils";

const getScoreStatus = (score: number): MetricStatus => {
    if (score >= 80) return MetricStatus.Healthy;
    if (score >= 60) return MetricStatus.Warning;
    return MetricStatus.Critical;
};

const getBarColor = (score: number): string => {
    if (score >= 80) return "bg-success";
    if (score >= 60) return "bg-warning";
    return "bg-error";
};

interface SectionCardProps {
    title: string;
    description?: string;
    children: React.ReactNode;
    onExport: (format: ReportExportFormat) => void;
    isExporting: boolean;
    canExport: boolean;
}

const SectionCard = ({
    title,
    description,
    children,
    onExport,
    isExporting,
    canExport,
}: SectionCardProps) => (
    <Card className="mb-6">
        <CardHeader>
            <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                    <CardTitle className="text-lg">{t(title)}</CardTitle>
                    {description && (
                        <p className="text-xs text-text-muted mt-1">
                            {t(description)}
                        </p>
                    )}
                </div>

                {canExport && (
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onExport("pdf")}
                            disabled={isExporting}
                            className="gap-1.5"
                        >
                            <Download className="h-3.5 w-3.5" />
                            {t("PDF")}
                        </Button>

                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onExport("excel")}
                            disabled={isExporting}
                            className="gap-1.5"
                        >
                            <FileSpreadsheet className="h-3.5 w-3.5" />
                            {t("Excel")}
                        </Button>
                    </div>
                )}
            </div>
        </CardHeader>

        <CardContent>{children}</CardContent>
    </Card>
);

export const ReportsView = () => {
    const p = usePermissions();
    const canExport = p.reports.export();

    const { projects } = useProjectsListLite();

    const [selectedProjectId, setSelectedProjectId] = useState<string>("");

    useEffect(() => {
        if (!selectedProjectId && projects.length > 0) {
            setSelectedProjectId(projects[0].id);
        }
    }, [projects, selectedProjectId]);

    const { report, isLoading } = useProjectReport(selectedProjectId);

    const { exportHandler, isLoading: isExporting } =
        useExportReportSection();

    const handleExport =
        (section: ReportSectionKey) =>
        (format: ReportExportFormat) => {
            if (!selectedProjectId) return;

            exportHandler(selectedProjectId, section, format);
        };

    return (
        <div>
            <Header
                title={t("Reports")}
                description={t(
                    "Multi-section project report with export per section"
                )}
                actions={
                    <Select
                        value={selectedProjectId}
                        onValueChange={setSelectedProjectId}
                    >
                        <SelectTrigger className="w-[240px]">
                            <SelectValue
                                placeholder={t("Select project")}
                            />
                        </SelectTrigger>

                        <SelectContent>
                            {projects.map((p) => (
                                <SelectItem key={p.id} value={p.id}>
                                    {p.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                }
            />

            {!selectedProjectId ? (
                <EmptyState
                    icon={Users}
                    title={t("No project selected")}
                    description={t(
                        "Pick a project to view its report."
                    )}
                />
            ) : isLoading && !report ? (
                <div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-text-muted">
                    {t("Loading report...")}
                </div>
            ) : !report ? (
                <div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-text-muted">
                    {t("No report available for this project.")}
                </div>
            ) : (
                <>
                    <div className="rounded-lg border border-border bg-card p-5 mb-6">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                            <div>
                                <h2 className="text-xl font-bold text-text-dark">
                                    {report.project.name}
                                </h2>

                                <p className="text-xs text-text-muted">
                                    {report.team.name}
                                </p>
                            </div>

                            <Badge
                                variant={
                                    report.project.status === "active"
                                        ? "success"
                                        : "secondary"
                                }
                            >
                                {t(report.project.status)}
                            </Badge>
                        </div>
                    </div>

                    <SectionCard
                        title="Overview"
                        description="Project context and attention items"
                        onExport={handleExport("overview")}
                        isExporting={isExporting}
                        canExport={canExport}
                    >
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                            <Stat
                                label={t("Sprints")}
                                value={report.overview.sprints_count}
                            />

                            <Stat
                                label={t("Tasks")}
                                value={`${report.overview.tasks_done}/${report.overview.tasks_total}`}
                            />

                            <Stat
                                label={t("On-time Rate")}
                                value={`${report.overview.on_time_rate}%`}
                            />

                            <Stat
                                label={t("Team")}
                                value={report.overview.team_name}
                            />
                        </div>

                        {report.overview.needs_attention.length > 0 && (
                            <div className="rounded-md bg-warning-light/40 border border-warning/30 px-3 py-2">
                                <p className="text-xs font-semibold text-warning mb-1">
                                    {t("Needs attention")}
                                </p>

                                <ul className="list-disc list-inside text-xs text-text-secondary space-y-0.5">
                                    {report.overview.needs_attention.map(
                                        (item, i) => (
                                            <li key={i}>{item}</li>
                                        )
                                    )}
                                </ul>
                            </div>
                        )}
                    </SectionCard>
                </>
            )}
        </div>
    );
};

interface StatProps {
    label: string;
    value: string | number;
    tone?: "error";
}

const Stat = ({ label, value, tone }: StatProps) => (
    <div className="rounded-md bg-muted/40 px-3 py-2">
        <p className="text-[10px] uppercase tracking-wide text-text-muted">
            {label}
        </p>

        <p
            className={cn(
                "text-base font-bold",
                tone === "error"
                    ? "text-error"
                    : "text-text-dark"
            )}
        >
            {value}
        </p>
    </div>
);