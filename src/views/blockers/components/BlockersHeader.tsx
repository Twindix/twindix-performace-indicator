import { Plus } from "lucide-react";

import { Button } from "@/atoms";
import { Header } from "@/components/shared";
import { t } from "@/hooks";
import type { BlockersHeaderPropsInterface } from "@/interfaces";

export const BlockersHeader = ({ canCreate, onCreate }: BlockersHeaderPropsInterface) => (
    <Header
        title={t("Blocker Tracker")}
        description={t("Track and manage blockers affecting sprint delivery")}
        actions={
            canCreate ? (
                <Button size="sm" className="gap-1.5" onClick={onCreate}>
                    <Plus className="h-4 w-4" />
                    {t("Add Blocker")}
                </Button>
            ) : null
        }
    />
);
