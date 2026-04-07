import { useMemo } from "react";
import { AlertTriangle, Layers, Shield, Users } from "lucide-react";

import { Badge, Card, CardContent, CardHeader, CardTitle } from "@/atoms";
import { AnimatedNumber, EmptyState, Header } from "@/components/shared";
import { t, useSettings } from "@/hooks";
import type { OwnershipEntryInterface, UserInterface } from "@/interfaces";
import { Avatar, AvatarFallback } from "@/ui";
import { cn, formatDate, getStorageItem, storageKeys } from "@/utils";

export const OwnershipView = () => {
    const [settings] = useSettings();
    const compact = settings.compactView;
    const entries = getStorageItem<OwnershipEntryInterface[]>(storageKeys.ownership) ?? [];
    const members = getStorageItem<UserInterface[]>(storageKeys.teamMembers) ?? [];

    const getMember = (id: string) => members.find((m) => m.id === id);

    const stats = useMemo(() => ({
        total: entries.length,
        withConflicts: entries.filter((e) => e.hasConflict).length,
        withBackup: entries.filter((e) => e.backupOwnerId).length,
    }), [entries]);

    const conflicts = useMemo(() => entries.filter((e) => e.hasConflict), [entries]);

    if (entries.length === 0) {
        return (
            <div>
                <Header title={t("Ownership Map")} description={t("Track component ownership and detect conflicts")} />
                <EmptyState icon={Shield} title={t("No Ownership Data")} description={t("No ownership entries available")} />
            </div>
        );
    }

    return (
        <div>
            <Header title={t("Ownership Map")} description={t("Track component ownership and detect conflicts")} />

            {/* Stats Row */}
            <div className={cn("grid grid-cols-1 sm:grid-cols-3", compact ? "gap-2 mb-3" : "gap-4 mb-6")}>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-lighter">
                                <Layers className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-text-dark"><AnimatedNumber value={stats.total} /></p>
                                <p className="text-xs text-text-muted">{t("Total Components")}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-error-light">
                                <AlertTriangle className="h-5 w-5 text-error" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-error"><AnimatedNumber value={stats.withConflicts} /></p>
                                <p className="text-xs text-text-muted">{t("With Conflicts")}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success-light">
                                <Users className="h-5 w-5 text-success" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-success"><AnimatedNumber value={stats.withBackup} /></p>
                                <p className="text-xs text-text-muted">{t("With Backup")}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* All Components Table */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Layers className="h-4 w-4 text-primary" />
                        {t("All Components")}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Desktop table */}
                    <div className="overflow-x-auto hidden md:block">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className={cn("text-left px-3 text-xs font-semibold text-text-muted uppercase tracking-wider", compact ? "py-2" : "py-3")}>{t("Component")}</th>
                                    <th className={cn("text-left px-3 text-xs font-semibold text-text-muted uppercase tracking-wider", compact ? "py-2" : "py-3")}>{t("Primary Owner")}</th>
                                    <th className={cn("text-left px-3 text-xs font-semibold text-text-muted uppercase tracking-wider", compact ? "py-2" : "py-3")}>{t("Backup Owner")}</th>
                                    <th className={cn("text-center px-3 text-xs font-semibold text-text-muted uppercase tracking-wider", compact ? "py-2" : "py-3")}>{t("Changes")}</th>
                                    <th className={cn("text-left px-3 text-xs font-semibold text-text-muted uppercase tracking-wider", compact ? "py-2" : "py-3")}>{t("Last Modified")}</th>
                                    <th className={cn("text-center px-3 text-xs font-semibold text-text-muted uppercase tracking-wider", compact ? "py-2" : "py-3")}>{t("Status")}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {entries.map((entry) => {
                                    const owner = getMember(entry.ownerId);
                                    const backup = entry.backupOwnerId ? getMember(entry.backupOwnerId) : null;

                                    return (
                                        <tr key={entry.id} className={cn("transition-colors hover:bg-muted/50", entry.hasConflict && "bg-error-light/30")}>
                                            <td className={cn("px-3", compact ? "py-1.5" : "py-3")}>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-text-dark">{entry.componentName}</span>
                                                    {entry.hasConflict && <AlertTriangle className="h-3.5 w-3.5 text-error shrink-0" />}
                                                </div>
                                            </td>
                                            <td className={cn("px-3", compact ? "py-1.5" : "py-3")}>
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-6 w-6">
                                                        <AvatarFallback className="text-[8px]">{owner?.avatar}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-text-secondary">{owner?.name ?? "Unknown"}</span>
                                                </div>
                                            </td>
                                            <td className={cn("px-3", compact ? "py-1.5" : "py-3")}>
                                                {backup ? (
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="h-6 w-6">
                                                            <AvatarFallback className="text-[8px]">{backup.avatar}</AvatarFallback>
                                                        </Avatar>
                                                        <span className="text-text-secondary">{backup.name}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-text-muted text-xs">{t("None")}</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-3 text-center">
                                                <span className="font-semibold text-text-dark">{entry.changeCount}</span>
                                            </td>
                                            <td className={cn("px-3", compact ? "py-1.5" : "py-3")}>
                                                <span className="text-text-secondary text-xs">{formatDate(entry.lastModified)}</span>
                                            </td>
                                            <td className="py-3 px-3 text-center">
                                                {entry.hasConflict ? (
                                                    <Badge variant="error">{t("Conflict")}</Badge>
                                                ) : (
                                                    <Badge variant="success">{t("OK")}</Badge>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile cards */}
                    <div className="flex flex-col gap-3 md:hidden">
                        {entries.map((entry) => {
                            const owner = getMember(entry.ownerId);
                            const backup = entry.backupOwnerId ? getMember(entry.backupOwnerId) : null;

                            return (
                                <div key={entry.id} className={cn("rounded-xl border border-border p-3", entry.hasConflict && "bg-error-light/30 border-error/40")}>
                                    <div className="flex items-center justify-between gap-2 mb-2">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className="text-sm font-medium text-text-dark truncate">{entry.componentName}</span>
                                            {entry.hasConflict && <AlertTriangle className="h-3.5 w-3.5 text-error shrink-0" />}
                                        </div>
                                        {entry.hasConflict ? (
                                            <Badge variant="error">{t("Conflict")}</Badge>
                                        ) : (
                                            <Badge variant="success">{t("OK")}</Badge>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-text-secondary mb-1">
                                        <Avatar className="h-5 w-5"><AvatarFallback className="text-[8px]">{owner?.avatar}</AvatarFallback></Avatar>
                                        <span>{owner?.name ?? "Unknown"}</span>
                                        {backup && (
                                            <>
                                                <span className="text-text-muted">/</span>
                                                <Avatar className="h-5 w-5"><AvatarFallback className="text-[8px]">{backup.avatar}</AvatarFallback></Avatar>
                                                <span>{backup.name}</span>
                                            </>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 text-[10px] text-text-muted">
                                        <span>{entry.changeCount} {t("Changes")}</span>
                                        <span>{formatDate(entry.lastModified)}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Conflicts Section */}
            {conflicts.length > 0 && (
                <div>
                    <h2 className="text-lg font-semibold text-text-dark mb-3 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-error" />
                        {t("Ownership Conflicts")}
                        <Badge variant="error">{conflicts.length}</Badge>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {conflicts.map((entry) => {
                            const owner = getMember(entry.ownerId);
                            const backup = entry.backupOwnerId ? getMember(entry.backupOwnerId) : null;

                            return (
                                <Card key={entry.id} className="border-error/40 bg-error-light/20">
                                    <CardContent className="p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-error/10">
                                                <AlertTriangle className="h-4 w-4 text-error" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-text-dark">{entry.componentName}</p>
                                                {entry.conflictDescription && (
                                                    <p className="text-xs text-error mt-1">{entry.conflictDescription}</p>
                                                )}
                                                <div className="flex items-center gap-3 mt-2">
                                                    <div className="flex items-center gap-1.5">
                                                        <Avatar className="h-5 w-5">
                                                            <AvatarFallback className="text-[7px]">{owner?.avatar}</AvatarFallback>
                                                        </Avatar>
                                                        <span className="text-xs text-text-secondary">{owner?.name ?? "Unknown"}</span>
                                                    </div>
                                                    {backup && (
                                                        <>
                                                            <span className="text-xs text-text-muted">/</span>
                                                            <div className="flex items-center gap-1.5">
                                                                <Avatar className="h-5 w-5">
                                                                    <AvatarFallback className="text-[7px]">{backup.avatar}</AvatarFallback>
                                                                </Avatar>
                                                                <span className="text-xs text-text-secondary">{backup.name}</span>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
