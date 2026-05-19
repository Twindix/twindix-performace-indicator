import { useState } from "react";
import { Download, FolderKanban, Plus } from "lucide-react";

import { Badge, Button, Card, CardContent, Input } from "@/atoms";
import { EmptyState, Header } from "@/components/shared";
import {
    t,
    useOwnershipFeed,
    usePermissions,
    useProjectsListLite,
} from "@/hooks";
import type { FeatureInterface } from "@/interfaces";
import { useProjectStore } from "@/store";
import { cn, downloadCsv, formatDate } from "@/utils";

import { FeatureFormDialog } from "./FeatureFormDialog";

const STATUS_VARIANT: Record<string, "default" | "success" | "warning" | "secondary"> = {
    planned: "warning",
    in_progress: "default",
    completed: "success",
    on_hold: "secondary",
};

const PRIORITY_CLASS: Record<string, string> = {
    low: "text-text-muted",
    medium: "text-warning",
    high: "text-error",
    critical: "text-error font-bold",
};

export const OwnershipView = () => {
    const p = usePermissions();
    const { projects } = useProjectsListLite();
    const { activeProjectId } = useProjectStore();
    const [selectedProjectId, setSelectedProjectId] = useState<string>("");
    const [query, setQuery] = useState("");
    const [createOpen, setCreateOpen] = useState(false);

    const effectiveProjectId = selectedProjectId || activeProjectId;
    const { items, isLoading, refetch } = useOwnershipFeed(effectiveProjectId);
    const canDownload = p.reports.downloadCSV();

    const handleDownloadFeatures = () => {
        const today = new Date().toISOString().slice(0, 10);
        const header = ["Feature ID", "Feature Name", "Description", "Status", "Priority", "Completion %", "Created At", "Updated At"];
        const rows = items.map((f: FeatureInterface) => [f.id, f.title, f.description ?? "", f.status, f.priority ?? "", "", f.created_at, f.updated_at]);
        downloadCsv(`ownership-features-${today}.csv`, [header, ...rows]);
    };

    const filtered = items.filter((f: FeatureInterface) => {
        if (query && !f.title.toLowerCase().includes(query.toLowerCase())) return false;
        return true;
    });

    return (
        <div>
            <Header
                title={t("Ownership")}
                description={t("Features and their authors across the platform")}
                actions={
                    <div className="flex items-center gap-2">
                        {canDownload && items.length > 0 && (
                            <Button size="sm" variant="outline" className="gap-1.5" onClick={handleDownloadFeatures}>
                                <Download className="h-4 w-4" />
                                {t("Download CSV")}
                            </Button>
                        )}
                        {p.features.create() && (
                            <Button size="sm" className="gap-1.5" onClick={() => setCreateOpen(true)}>
                                <Plus className="h-4 w-4" />
                                {t("Create Feature")}
                            </Button>
                        )}
                    </div>
                }
            />

            <div className="flex items-center gap-2 mb-4 flex-wrap">
                <button
                    type="button"
                    onClick={() => setSelectedProjectId("")}
                    className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer",
                        selectedProjectId === ""
                            ? "border-primary bg-primary-lighter text-primary"
                            : "border-border text-text-muted hover:text-text-dark hover:bg-muted/40",
                    )}
                >
                    {t("All Projects")}
                </button>
                {projects.map((proj) => (
                    <button
                        key={proj.id}
                        type="button"
                        onClick={() => setSelectedProjectId(proj.id)}
                        className={cn(
                            "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer",
                            selectedProjectId === proj.id
                                ? "border-primary bg-primary-lighter text-primary"
                                : "border-border text-text-muted hover:text-text-dark hover:bg-muted/40",
                        )}
                    >
                        {proj.name}
                    </button>
                ))}
            </div>

            <div className="flex flex-wrap items-center gap-3 mb-4">
                <Input
                    placeholder={t("Search features…")}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="max-w-xs"
                />
            </div>

            {isLoading && items.length === 0 ? (
                <div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-text-muted">
                    {t("Loading...")}
                </div>
            ) : filtered.length === 0 ? (
                <EmptyState icon={FolderKanban} title={t("No features")} description={t("No features found for this project")} />
            ) : (
                <div className="grid grid-cols-1 gap-3">
                    {filtered.map((feature: FeatureInterface) => (
                        <Card key={feature.id}>
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between gap-3 mb-2">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className="flex h-7 w-7 items-center justify-center rounded-md shrink-0 bg-primary-lighter text-primary">
                                            <FolderKanban className="h-3.5 w-3.5" />
                                        </span>
                                        <h3 className="text-sm font-semibold text-text-dark truncate">{feature.title}</h3>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        {feature.priority && (
                                            <span className={cn("text-[10px] uppercase font-semibold", PRIORITY_CLASS[feature.priority] ?? "text-text-muted")}>
                                                {t(feature.priority)}
                                            </span>
                                        )}
                                        <Badge variant={STATUS_VARIANT[feature.status] ?? "secondary"} className="text-[10px]">
                                            {t(feature.status)}
                                        </Badge>
                                    </div>
                                </div>
                                {feature.description && <p className="text-xs text-text-muted mb-3">{feature.description}</p>}
                                <div className="flex flex-wrap items-center gap-3 text-[11px] text-text-muted">
                                    <span>{t("Created")}: {formatDate(feature.created_at)}</span>
                                    <span>{t("Updated")}: {formatDate(feature.updated_at)}</span>
                                    {feature.linked_tasks_count != null && feature.linked_tasks_count > 0 && (
                                        <span>{feature.linked_tasks_count} {t("linked tasks")}</span>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <FeatureFormDialog
                open={createOpen}
                onOpenChange={setCreateOpen}
                onCreated={refetch}
            />
        </div>
    );
};
