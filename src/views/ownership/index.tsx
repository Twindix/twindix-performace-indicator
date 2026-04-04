import { useMemo } from "react";
import { AlertTriangle, Layers, Shield, Users } from "lucide-react";

import { Badge, Card, CardContent, CardHeader, CardTitle } from "@/atoms";
import { EmptyState, Header } from "@/components/shared";
import { t, useSettings } from "@/hooks";
import type { OwnershipEntryInterface, UserInterface } from "@/interfaces";
import { Avatar, AvatarFallback } from "@/ui";
import { cn, formatDate, getStorageItem, storageKeys } from "@/utils";

export const OwnershipView = () => {
    useSettings();
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
                <EmptyState icon={Shield} title="No Ownership Data" description="No ownership entries available. Add components to start mapping ownership." />
            </div>
        );
    }

    return (
        <div>
            <Header title={t("Ownership Map")} description={t("Track component ownership and detect conflicts")} />

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-lighter">
                                <Layers className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-text-dark">{stats.total}</p>
                                <p className="text-xs text-text-muted">Total Components</p>
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
                                <p className="text-2xl font-bold text-error">{stats.withConflicts}</p>
                                <p className="text-xs text-text-muted">With Conflicts</p>
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
                                <p className="text-2xl font-bold text-success">{stats.withBackup}</p>
                                <p className="text-xs text-text-muted">With Backup Owners</p>
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
                        All Components
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left py-3 px-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Component</th>
                                    <th className="text-left py-3 px-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Primary Owner</th>
                                    <th className="text-left py-3 px-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Backup Owner</th>
                                    <th className="text-center py-3 px-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Changes</th>
                                    <th className="text-left py-3 px-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Last Modified</th>
                                    <th className="text-center py-3 px-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {entries.map((entry) => {
                                    const owner = getMember(entry.ownerId);
                                    const backup = entry.backupOwnerId ? getMember(entry.backupOwnerId) : null;

                                    return (
                                        <tr key={entry.id} className={cn("transition-colors hover:bg-muted/50", entry.hasConflict && "bg-error-light/30")}>
                                            <td className="py-3 px-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-text-dark">{entry.componentName}</span>
                                                    {entry.hasConflict && <AlertTriangle className="h-3.5 w-3.5 text-error shrink-0" />}
                                                </div>
                                            </td>
                                            <td className="py-3 px-3">
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-6 w-6">
                                                        <AvatarFallback className="text-[8px]">{owner?.avatar}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-text-secondary">{owner?.name ?? "Unknown"}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-3">
                                                {backup ? (
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="h-6 w-6">
                                                            <AvatarFallback className="text-[8px]">{backup.avatar}</AvatarFallback>
                                                        </Avatar>
                                                        <span className="text-text-secondary">{backup.name}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-text-muted text-xs">None</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-3 text-center">
                                                <span className="font-semibold text-text-dark">{entry.changeCount}</span>
                                            </td>
                                            <td className="py-3 px-3">
                                                <span className="text-text-secondary text-xs">{formatDate(entry.lastModified)}</span>
                                            </td>
                                            <td className="py-3 px-3 text-center">
                                                {entry.hasConflict ? (
                                                    <Badge variant="error">Conflict</Badge>
                                                ) : (
                                                    <Badge variant="success">OK</Badge>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Conflicts Section */}
            {conflicts.length > 0 && (
                <div>
                    <h2 className="text-lg font-semibold text-text-dark mb-3 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-error" />
                        Ownership Conflicts
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
