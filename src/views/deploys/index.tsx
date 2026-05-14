import { useMemo, useState } from "react";
import { Archive, ChevronDown, Download, Filter, Package, Plus, Rocket, Search, Smartphone, Trash2, X } from "lucide-react";

import { Badge, Button, Card, CardContent, Input } from "@/atoms";
import { EmptyState, Header } from "@/components/shared";
import { DeployEnvironment, DeployStatus } from "@/enums";
import { t, usePermissions } from "@/hooks";
import type { DeployInterface } from "@/interfaces";
import { useDeployStore } from "@/store";
import { Avatar, AvatarFallback, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui";
import { cn, formatDateTime } from "@/utils";
import { UploadDeployDialog } from "./UploadDeployDialog";

const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(2)} MB`;
    return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
};

const relativeTime = (iso: string): string => {
    const diffMs = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diffMs / 60_000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins} min ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    return `${months}mo ago`;
};

const iconForFile = (fileName: string) => {
    const ext = fileName.toLowerCase().split(".").pop() ?? "";
    if (["apk", "ipa", "aab"].includes(ext)) return Smartphone;
    if (["zip", "tar", "gz", "rar", "7z", "tgz", "bz2"].includes(ext)) return Archive;
    if (["dmg", "pkg", "deb", "rpm", "exe", "msi"].includes(ext)) return Package;
    return Package;
};

const envConfig: Record<DeployEnvironment, { label: string; tone: string; ring: string }> = {
    [DeployEnvironment.Production]: { label: "Production", tone: "text-success", ring: "bg-success" },
    [DeployEnvironment.Staging]:    { label: "Staging",    tone: "text-warning", ring: "bg-warning" },
    [DeployEnvironment.Preview]:    { label: "Preview",    tone: "text-primary", ring: "bg-primary" },
};

const statusBadge = (status: DeployStatus) => {
    if (status === DeployStatus.Ready) return <Badge variant="success" className="text-[10px]">{t("Ready")}</Badge>;
    if (status === DeployStatus.Deprecated) return <Badge variant="warning" className="text-[10px]">{t("Deprecated")}</Badge>;
    return <Badge variant="error" className="text-[10px]">{t("Rolled Back")}</Badge>;
};

export const DeploysView = () => {
    const p = usePermissions();
    const deploys = useDeployStore((s) => s.deploys);
    const removeDeploy = useDeployStore((s) => s.removeDeploy);

    const [uploadOpen, setUploadOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [envFilter, setEnvFilter] = useState<DeployEnvironment | "all">("all");
    const [statusFilter, setStatusFilter] = useState<DeployStatus | "all">("all");
    const [uploaderFilter, setUploaderFilter] = useState<string>("all");
    const [expanded, setExpanded] = useState<Set<string>>(new Set());

    const uploaders = useMemo(() => {
        const map = new Map<string, { id: string; full_name: string; avatar_initials: string }>();
        deploys.forEach((d) => map.set(d.uploaded_by.id, d.uploaded_by));
        return Array.from(map.values());
    }, [deploys]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return deploys.filter((d) => {
            if (envFilter !== "all" && d.environment !== envFilter) return false;
            if (statusFilter !== "all" && d.status !== statusFilter) return false;
            if (uploaderFilter !== "all" && d.uploaded_by.id !== uploaderFilter) return false;
            if (q && !(d.title.toLowerCase().includes(q) || d.file_name.toLowerCase().includes(q) || (d.version ?? "").toLowerCase().includes(q))) return false;
            return true;
        });
    }, [deploys, search, envFilter, statusFilter, uploaderFilter]);

    // Stats
    const stats = useMemo(() => ({
        total: deploys.length,
        ready: deploys.filter((d) => d.status === DeployStatus.Ready).length,
        totalSize: deploys.reduce((s, d) => s + d.file_size, 0),
        thisWeek: deploys.filter((d) => Date.now() - new Date(d.uploaded_at).getTime() < 7 * 86400_000).length,
    }), [deploys]);

    const latest = filtered[0];
    const rest = filtered.slice(1);

    const toggleExpanded = (id: string) =>
        setExpanded((s) => {
            const next = new Set(s);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });

    const handleDownload = (d: DeployInterface) => {
        if (d.download_url) {
            const a = document.createElement("a");
            a.href = d.download_url;
            a.download = d.file_name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            return;
        }
        // Fallback for seeded entries with no real blob — produce a tiny placeholder file
        const blob = new Blob([`# ${d.title} ${d.version ?? ""}\n\nDemo download — backend integration pending.\n`], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = d.file_name.replace(/\.[^.]+$/, ".txt");
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const clearFilters = () => {
        setSearch("");
        setEnvFilter("all");
        setStatusFilter("all");
        setUploaderFilter("all");
    };
    const hasFilters = search || envFilter !== "all" || statusFilter !== "all" || uploaderFilter !== "all";

    const canCreate = p.tasks.create(); // Reuse a generic create permission — deploys are open to any team

    return (
        <div className="flex-1 flex flex-col">
            <Header
                title={t("Deploys")}
                description={t("Build artifacts and changelog history. Managers are notified on each upload.")}
                actions={
                    canCreate ? (
                        <Button size="sm" className="gap-1.5" onClick={() => setUploadOpen(true)}>
                            <Plus className="h-4 w-4" />
                            {t("New Deploy")}
                        </Button>
                    ) : null
                }
            />

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <Stat label={t("Total Deploys")} value={stats.total} accent="text-text-dark" />
                <Stat label={t("Ready")}          value={stats.ready} accent="text-success" />
                <Stat label={t("This Week")}      value={stats.thisWeek} accent="text-primary" />
                <Stat label={t("Total Size")}     value={formatSize(stats.totalSize)} accent="text-text-dark" />
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <CardContent className="p-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="relative flex-1 min-w-[200px] max-w-sm">
                            <Search className="absolute top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" style={{ insetInlineStart: 12 }} />
                            <Input placeholder={t("Search title, file, version…")} value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingInlineStart: 40 }} />
                        </div>
                        <Filter className="h-4 w-4 text-text-muted hidden sm:block" />
                        <Select value={envFilter} onValueChange={(v) => setEnvFilter(v as typeof envFilter)}>
                            <SelectTrigger className="w-[150px] h-9 text-xs"><SelectValue placeholder={t("Environment")} /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t("All Environments")}</SelectItem>
                                {Object.values(DeployEnvironment).map((e) => (
                                    <SelectItem key={e} value={e}>{t(envConfig[e].label)}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
                            <SelectTrigger className="w-[140px] h-9 text-xs"><SelectValue placeholder={t("Status")} /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t("All Statuses")}</SelectItem>
                                <SelectItem value={DeployStatus.Ready}>{t("Ready")}</SelectItem>
                                <SelectItem value={DeployStatus.Deprecated}>{t("Deprecated")}</SelectItem>
                                <SelectItem value={DeployStatus.RolledBack}>{t("Rolled Back")}</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={uploaderFilter} onValueChange={setUploaderFilter}>
                            <SelectTrigger className="w-[180px] h-9 text-xs"><SelectValue placeholder={t("Uploader")} /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t("All Uploaders")}</SelectItem>
                                {uploaders.map((u) => <SelectItem key={u.id} value={u.id}>{u.full_name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        {hasFilters && (
                            <button onClick={clearFilters} className="text-xs text-text-muted hover:text-text-dark flex items-center gap-1">
                                <X className="h-3 w-3" /> {t("Clear")}
                            </button>
                        )}
                        <span className="ms-auto text-xs text-text-muted tabular-nums">
                            {filtered.length} / {deploys.length}
                        </span>
                    </div>
                </CardContent>
            </Card>

            {filtered.length === 0 ? (
                <EmptyState icon={Rocket} title={t("No deploys yet")} description={t("Upload your first build to start the changelog.")} />
            ) : (
                <div className="flex flex-col gap-4">
                    {/* LATEST hero card */}
                    {latest && (
                        <LatestDeployCard
                            d={latest}
                            expanded={expanded.has(latest.id)}
                            onToggle={() => toggleExpanded(latest.id)}
                            onDownload={() => handleDownload(latest)}
                            onDelete={() => removeDeploy(latest.id)}
                            canDelete={canCreate}
                        />
                    )}

                    {/* TIMELINE for older deploys */}
                    {rest.length > 0 && (
                        <div className="relative">
                            {/* Vertical timeline rail */}
                            <span aria-hidden className="absolute top-2 bottom-2 w-px bg-border" style={{ insetInlineStart: 19 }} />
                            <div className="flex flex-col gap-3">
                                {rest.map((d) => (
                                    <TimelineDeployCard
                                        key={d.id}
                                        d={d}
                                        expanded={expanded.has(d.id)}
                                        onToggle={() => toggleExpanded(d.id)}
                                        onDownload={() => handleDownload(d)}
                                        onDelete={() => removeDeploy(d.id)}
                                        canDelete={canCreate}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <UploadDeployDialog open={uploadOpen} onOpenChange={setUploadOpen} />
        </div>
    );
};

// ── Stat tile ────────────────────────────────────────────────────────────
const Stat = ({ label, value, accent }: { label: string; value: string | number; accent: string }) => (
    <Card>
        <CardContent className="p-4 text-center">
            <p className={cn("text-2xl font-bold tabular-nums", accent)}>{value}</p>
            <p className="text-[10px] uppercase tracking-[0.12em] text-text-muted mt-1">{label}</p>
        </CardContent>
    </Card>
);

// ── Latest deploy — hero treatment ───────────────────────────────────────
interface DeployCardProps {
    d: DeployInterface;
    expanded: boolean;
    onToggle: () => void;
    onDownload: () => void;
    onDelete: () => void;
    canDelete: boolean;
}

const LatestDeployCard = ({ d, expanded, onToggle, onDownload, onDelete, canDelete }: DeployCardProps) => {
    const FileTypeIcon = iconForFile(d.file_name);
    const env = envConfig[d.environment];
    return (
        <Card className="relative overflow-hidden border-primary/40 bg-gradient-to-br from-primary/[0.06] via-card to-card">
            {/* Accent rail */}
            <span aria-hidden className="absolute inset-y-0 start-0 w-1 bg-primary" />
            <CardContent className="p-5 ps-6">
                <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground shrink-0 shadow-md">
                        <FileTypeIcon className="h-7 w-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                            <Badge variant="default" className="text-[9px] uppercase tracking-wider">{t("Latest")}</Badge>
                            {statusBadge(d.status)}
                            <span className={cn("inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em]", env.tone)}>
                                <span className={cn("h-1.5 w-1.5 rounded-full", env.ring)} />
                                {t(env.label)}
                            </span>
                        </div>
                        <h2 className="text-xl font-bold text-text-dark flex items-baseline gap-2 flex-wrap">
                            {d.title}
                            {d.version && <span className="font-mono text-base text-primary tabular-nums">{d.version}</span>}
                        </h2>
                        <p className="text-xs text-text-muted mt-1 truncate">
                            <span className="font-mono">{d.file_name}</span> · {formatSize(d.file_size)}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <Button size="sm" className="gap-1.5" onClick={onDownload}>
                            <Download className="h-4 w-4" />
                            {t("Download")}
                        </Button>
                        {canDelete && (
                            <button
                                onClick={onDelete}
                                className="p-2 rounded-md text-text-muted hover:text-error hover:bg-error-light"
                                aria-label={t("Delete deploy")}
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Uploader strip */}
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border/60">
                    <Avatar className="h-7 w-7">
                        <AvatarFallback className="text-[10px]">{d.uploaded_by.avatar_initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-text-dark truncate">{d.uploaded_by.full_name}</p>
                        {d.uploaded_by.role_label && <p className="text-[11px] text-text-muted truncate">{d.uploaded_by.role_label}</p>}
                    </div>
                    <span className="text-xs text-text-muted tabular-nums whitespace-nowrap">
                        {relativeTime(d.uploaded_at)} · {formatDateTime(d.uploaded_at)}
                    </span>
                </div>

                {/* Changelog */}
                <ChangelogList changes={d.changes} expanded={expanded} onToggle={onToggle} />
            </CardContent>
        </Card>
    );
};

// ── Timeline-style card ───────────────────────────────────────────────────
const TimelineDeployCard = ({ d, expanded, onToggle, onDownload, onDelete, canDelete }: DeployCardProps) => {
    const FileTypeIcon = iconForFile(d.file_name);
    const env = envConfig[d.environment];
    return (
        <div className="flex gap-4">
            {/* Timeline dot */}
            <div className="relative shrink-0 z-10">
                <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg shrink-0 ring-4 ring-background",
                    d.status === DeployStatus.Ready ? "bg-card text-text-dark border border-border" :
                    d.status === DeployStatus.Deprecated ? "bg-warning-light text-warning" :
                    "bg-error-light text-error",
                )}>
                    <FileTypeIcon className="h-5 w-5" />
                </div>
            </div>

            <Card className="flex-1 hover:border-primary/30 transition-colors">
                <CardContent className="p-4">
                    <div className="flex items-start gap-3 flex-wrap">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                <h3 className="text-sm font-bold text-text-dark">{d.title}</h3>
                                {d.version && <span className="font-mono text-xs text-primary tabular-nums">{d.version}</span>}
                                {statusBadge(d.status)}
                                <span className={cn("inline-flex items-center gap-1 text-[10px] uppercase tracking-wider", env.tone)}>
                                    <span className={cn("h-1 w-1 rounded-full", env.ring)} />
                                    {t(env.label)}
                                </span>
                            </div>
                            <p className="text-[11px] text-text-muted truncate">
                                <span className="font-mono">{d.file_name}</span> · {formatSize(d.file_size)}
                            </p>
                            <div className="flex items-center gap-2 mt-2 text-xs">
                                <Avatar className="h-5 w-5">
                                    <AvatarFallback className="text-[8px]">{d.uploaded_by.avatar_initials}</AvatarFallback>
                                </Avatar>
                                <span className="text-text-secondary">{d.uploaded_by.full_name}</span>
                                <span className="text-text-muted">·</span>
                                <span className="text-text-muted tabular-nums">{relativeTime(d.uploaded_at)}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                            <Button size="sm" variant="outline" className="h-8 gap-1.5" onClick={onDownload}>
                                <Download className="h-3.5 w-3.5" />
                                {t("Download")}
                            </Button>
                            {canDelete && (
                                <button onClick={onDelete} className="p-1.5 rounded-md text-text-muted hover:text-error hover:bg-error-light" aria-label={t("Delete")}>
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>
                    </div>

                    <ChangelogList changes={d.changes} expanded={expanded} onToggle={onToggle} />
                </CardContent>
            </Card>
        </div>
    );
};

// ── Changelog list with expand/collapse ──────────────────────────────────
const ChangelogList = ({ changes, expanded, onToggle }: { changes: string[]; expanded: boolean; onToggle: () => void }) => {
    if (changes.length === 0) return null;
    const visible = expanded ? changes : changes.slice(0, 2);
    const hidden = changes.length - 2;
    return (
        <div className="mt-3">
            <ul className="flex flex-col gap-1.5">
                {visible.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-text-secondary">
                        <span aria-hidden className="mt-1.5 h-1 w-1 rounded-full bg-primary shrink-0" />
                        <span className="leading-relaxed">{c}</span>
                    </li>
                ))}
            </ul>
            {hidden > 0 && (
                <button
                    onClick={onToggle}
                    className="mt-2 inline-flex items-center gap-1 text-[11px] text-primary hover:text-primary-dark font-medium"
                >
                    <ChevronDown className={cn("h-3 w-3 transition-transform", expanded && "rotate-180")} />
                    {expanded ? t("Collapse") : `${t("Show")} ${hidden} ${t("more")}`}
                </button>
            )}
        </div>
    );
};
