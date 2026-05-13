import { useCallback, useEffect, useRef, useState, type DragEvent } from "react";
import { File as FileIcon, UploadCloud, X } from "lucide-react";

import { Button, Input, Label, Textarea } from "@/atoms";
import { DeployEnvironment, DeployStatus } from "@/enums";
import { t } from "@/hooks";
import type { DeployInterface } from "@/interfaces";
import { useAuthStore, useDeployStore } from "@/store";
import { cn } from "@/utils";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const newId = () => `dep-${Math.random().toString(36).slice(2, 10)}`;

export const UploadDeployDialog = ({ open, onOpenChange }: Props) => {
    const { user } = useAuthStore();
    const addDeploy = useDeployStore((s) => s.addDeploy);

    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState("");
    const [version, setVersion] = useState("");
    const [changes, setChanges] = useState("");
    const [environment, setEnvironment] = useState<DeployEnvironment>(DeployEnvironment.Production);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!open) {
            setFile(null);
            setTitle("");
            setVersion("");
            setChanges("");
            setEnvironment(DeployEnvironment.Production);
            setIsDragging(false);
        }
    }, [open]);

    const acceptFile = useCallback((f: File | null) => {
        if (!f) return;
        setFile(f);
        if (!title.trim()) {
            // Strip extension and humanize
            const base = f.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
            setTitle(base.charAt(0).toUpperCase() + base.slice(1));
        }
    }, [title]);

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };
    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };
    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const dropped = e.dataTransfer.files?.[0];
        if (dropped) acceptFile(dropped);
    };

    const handleSubmit = () => {
        if (!file || !title.trim() || !user) return;
        const bullets = changes
            .split("\n")
            .map((s) => s.replace(/^[•\-*\s]+/, "").trim())
            .filter(Boolean);

        const deploy: DeployInterface = {
            id: newId(),
            title: title.trim(),
            version: version.trim() || null,
            file_name: file.name,
            file_size: file.size,
            file_type: file.type || file.name.split(".").pop() || "binary",
            environment,
            status: DeployStatus.Ready,
            changes: bullets.length > 0 ? bullets : [t("No changelog provided")],
            uploaded_by: {
                id: user.id,
                full_name: user.full_name,
                avatar_initials: user.avatar_initials,
                role_label: user.role_label ?? null,
            },
            uploaded_at: new Date().toISOString(),
            download_url: URL.createObjectURL(file),
        };
        addDeploy(deploy);
        onOpenChange(false);
    };

    const fileTooBig = file && file.size > 250 * 1024 * 1024; // 250 MB demo cap
    const canSubmit = !!file && !!title.trim() && !fileTooBig;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UploadCloud className="h-5 w-5 text-primary" />
                        {t("New Deploy")}
                    </DialogTitle>
                    <DialogDescription>
                        {t("Upload a build artifact. Managers receive a notification when this is submitted.")}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4 mt-2">
                    {/* Drag & drop zone */}
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={cn(
                            "relative cursor-pointer rounded-xl border-2 border-dashed transition-all duration-200",
                            "p-6 text-center",
                            isDragging
                                ? "border-primary bg-primary/8"
                                : file
                                    ? "border-primary/40 bg-primary/4"
                                    : "border-border hover:border-primary/40 hover:bg-muted/40",
                        )}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            onChange={(e) => acceptFile(e.target.files?.[0] ?? null)}
                        />
                        {file ? (
                            <div className="flex items-center gap-3 text-start">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground shrink-0">
                                    <FileIcon className="h-6 w-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-text-dark truncate">{file.name}</p>
                                    <p className="text-xs text-text-muted tabular-nums">
                                        {(file.size / 1024 / 1024).toFixed(2)} MB · {file.type || "unknown"}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                    className="p-1.5 rounded-md text-text-muted hover:text-error hover:bg-error-light"
                                    aria-label={t("Remove file")}
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2 py-2">
                                <UploadCloud className={cn("h-8 w-8 transition-colors", isDragging ? "text-primary" : "text-text-muted")} />
                                <p className="text-sm font-medium text-text-dark">
                                    {isDragging ? t("Drop the file here") : t("Drag a build file or click to browse")}
                                </p>
                                <p className="text-xs text-text-muted">{t("Up to 250 MB · any format")}</p>
                            </div>
                        )}
                    </div>
                    {fileTooBig && (
                        <p className="text-xs text-error">{t("File exceeds the 250 MB demo limit.")}</p>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
                            <Label htmlFor="dep-title">{t("Title")} <span className="text-error">*</span></Label>
                            <Input id="dep-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("API Service")} />
                        </div>
                        <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
                            <Label htmlFor="dep-version">{t("Version")}</Label>
                            <Input id="dep-version" value={version} onChange={(e) => setVersion(e.target.value)} placeholder="v2.14.0" />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label>{t("Environment")}</Label>
                        <Select value={environment} onValueChange={(v) => setEnvironment(v as DeployEnvironment)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value={DeployEnvironment.Production}>{t("Production")}</SelectItem>
                                <SelectItem value={DeployEnvironment.Staging}>{t("Staging")}</SelectItem>
                                <SelectItem value={DeployEnvironment.Preview}>{t("Preview")}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="dep-changes">{t("Changes")}</Label>
                        <Textarea
                            id="dep-changes"
                            rows={5}
                            value={changes}
                            onChange={(e) => setChanges(e.target.value)}
                            placeholder={t("One bullet per line:\nAdded GraphQL endpoint…\nFixed CVE-2026-1184…")}
                            className="font-mono text-xs"
                        />
                        <p className="text-[11px] text-text-muted">{t("One line per change. Bullets are added automatically.")}</p>
                    </div>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                    <DialogClose asChild>
                        <Button variant="outline">{t("Cancel")}</Button>
                    </DialogClose>
                    <Button onClick={handleSubmit} disabled={!canSubmit}>
                        {t("Submit Deploy")}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
