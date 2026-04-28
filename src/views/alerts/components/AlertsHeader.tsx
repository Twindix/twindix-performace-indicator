import { Plus } from "lucide-react";

import { Button } from "@/atoms";
import { Header } from "@/components/shared";
import { t } from "@/hooks";
import type { AlertsHeaderPropsInterface } from "@/interfaces";

export const AlertsHeader = ({ canCreate, onCreate }: AlertsHeaderPropsInterface) => (
    <Header
        title={t("Alerts")}
        description={t("Create announcements and track acknowledgements.")}
        actions={
            canCreate ? (
                <Button onClick={onCreate} className="gap-2">
                    <Plus className="h-4 w-4" />
                    {t("Create Alert")}
                </Button>
            ) : null
        }
    />
);
