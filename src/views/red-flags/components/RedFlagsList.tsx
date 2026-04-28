import type { RedFlagsListPropsInterface } from "@/interfaces/red-flags";

import { RedFlagCard } from "./RedFlagCard";

export const RedFlagsList = ({ redFlags, canEditFor, canDeleteFor, onEdit, onDelete }: RedFlagsListPropsInterface) => (
    <div className="flex flex-col gap-3">
        {redFlags.map((redFlag) => (
            <RedFlagCard
                key={redFlag.id}
                redFlag={redFlag}
                canEdit={canEditFor(redFlag)}
                canDelete={canDeleteFor(redFlag)}
                onEdit={onEdit}
                onDelete={onDelete}
            />
        ))}
    </div>
);
