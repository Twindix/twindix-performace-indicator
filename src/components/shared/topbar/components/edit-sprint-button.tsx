import { Pencil } from "lucide-react";

import { Button } from "@/atoms";
import { t } from "@/hooks";
import type { EditSprintButtonPropsInterface } from "@/interfaces";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/ui";

export const EditSprintButton = ({ disabled, onClick }: EditSprintButtonPropsInterface) => (
    <TooltipProvider delayDuration={300}>
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClick}
                    disabled={disabled}
                    className="h-9 w-9"
                    aria-label={t("Edit sprint")}
                >
                    <Pencil className="h-4 w-4" />
                </Button>
            </TooltipTrigger>
            <TooltipContent>{t("Edit sprint")}</TooltipContent>
        </Tooltip>
    </TooltipProvider>
);
