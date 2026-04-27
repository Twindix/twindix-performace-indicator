import { Plus } from "lucide-react";

import { Button } from "@/atoms";
import { Header } from "@/components/shared";
import { t } from "@/hooks";
import type { TeamsHeaderPropsInterface } from "@/interfaces";

export const TeamsHeader = ({ canCreate, onCreate }: TeamsHeaderPropsInterface) => (
    <Header
        title={t("Teams")}
        description={t("Organize members into teams.")}
        actions={
            canCreate ? (
                <Button size="sm" className="gap-1.5" onClick={onCreate}>
                    <Plus className="h-4 w-4" />
                    {t("Add Team")}
                </Button>
            ) : null
        }
    />
);
