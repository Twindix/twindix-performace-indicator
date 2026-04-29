import { Users } from "lucide-react";

import { EmptyState, QueryBoundary } from "@/components/shared";
import { TeamsSkeleton } from "@/components/skeletons";
import { t } from "@/hooks";
import type { TeamInterface, TeamsGridPropsInterface } from "@/interfaces";

import { TeamCard } from "./card";

export const TeamsGrid = ({ teams, isLoading, deleteTargetId, canManage, onCardClick, onEdit, onDelete }: TeamsGridPropsInterface) => (
    <QueryBoundary
        isLoading={isLoading}
        skeleton={<TeamsSkeleton />}
        empty={teams.length === 0}
        emptyState={<EmptyState icon={Users} title={t("No teams yet")} description={t("Create your first team to group members.")} />}
    >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.filter((team: TeamInterface) => team.id !== deleteTargetId).map((team: TeamInterface) => (
                <TeamCard
                    key={team.id}
                    team={team}
                    canManage={canManage}
                    onClick={() => onCardClick(team.id)}
                    onEdit={() => onEdit(team)}
                    onDelete={() => onDelete(team)}
                />
            ))}
        </div>
    </QueryBoundary>
);
