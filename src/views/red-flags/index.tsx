import { useState } from "react";
import { Flag, Plus } from "lucide-react";

import { Button } from "@/atoms";
import { EmptyState, Header, QueryBoundary } from "@/components/shared";
import { RedFlagsSkeleton } from "@/components/skeletons";
import { t, usePermissions, useRedFlagsList } from "@/hooks";
import type { RedFlagInterface } from "@/interfaces";
import { useSprintStore } from "@/store";

import { RedFlagsList } from "./components";
import { DeleteRedFlagDialog, RedFlagFormDialog } from "./dialogs";

export const RedFlagsView = () => {
    const p = usePermissions();
    const { activeSprintId } = useSprintStore();
    const { redFlags, isLoading, patchRedFlagLocal, removeRedFlagLocal } = useRedFlagsList(activeSprintId);

    const [formOpen, setFormOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<RedFlagInterface | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<RedFlagInterface | null>(null);

    const openAdd = () => { setEditTarget(null); setFormOpen(true); };
    const openEdit = (redFlag: RedFlagInterface) => { setEditTarget(redFlag); setFormOpen(true); };
    const closeForm = (open: boolean) => {
        if (open) return;
        setFormOpen(false);
        setEditTarget(null);
    };

    return (
        <div>
            <Header
                title={t("Red Flags")}
                description={t("Track and manage sprint risk indicators.")}
                actions={
                    p.redFlags.create() ? (
                        <Button size="sm" className="gap-1.5" onClick={openAdd}>
                            <Plus className="h-4 w-4" />{t("Add Red Flag")}
                        </Button>
                    ) : null
                }
            />

            <QueryBoundary
                isLoading={isLoading}
                skeleton={<RedFlagsSkeleton />}
                empty={redFlags.length === 0}
                emptyState={<EmptyState icon={Flag} title={t("No red flags")} description={t("No risks identified for this sprint.")} />}
            >
                <RedFlagsList
                    redFlags={redFlags}
                    canEditFor={(f) => p.redFlags.edit(f)}
                    canDeleteFor={(f) => p.redFlags.delete(f)}
                    onEdit={openEdit}
                    onDelete={setDeleteTarget}
                />
            </QueryBoundary>

            <RedFlagFormDialog
                open={formOpen}
                target={editTarget}
                onOpenChange={closeForm}
                onSaved={patchRedFlagLocal}
            />

            <DeleteRedFlagDialog
                target={deleteTarget}
                onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
                onDeleted={(id) => { removeRedFlagLocal(id); setDeleteTarget(null); }}
            />
        </div>
    );
};
