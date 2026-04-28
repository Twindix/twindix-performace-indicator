import { Edit, Trash2, Users } from "lucide-react";

import { EntityCard } from "@/components/shared";
import { t } from "@/hooks";
import type { TeamCardPropsInterface } from "@/interfaces";

export const TeamCard = ({ team, canManage, onClick, onEdit, onDelete }: TeamCardPropsInterface) => (
    <EntityCard className="cursor-pointer" contentClassName="p-5" onClick={onClick}>
        <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-lighter text-primary-medium shrink-0">
                <Users className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-text-dark truncate flex-1">{team.name}</h3>
            {canManage && (
                <EntityCard.Menu items={[
                    { label: t("Edit"), icon: Edit, onSelect: onEdit },
                    { label: t("Delete"), icon: Trash2, onSelect: onDelete, danger: true },
                ]} />
            )}
        </div>
    </EntityCard>
);
