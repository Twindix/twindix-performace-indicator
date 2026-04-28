import { Moon, Sun } from "lucide-react";

import { Button } from "@/atoms";
import { t } from "@/hooks";
import type { ThemeTogglePropsInterface } from "@/interfaces";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/ui";

export const ThemeToggle = ({ isDarkMode, onToggle }: ThemeTogglePropsInterface) => (
    <TooltipProvider delayDuration={300}>
        <Tooltip>
            <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={onToggle} className="h-9 w-9">
                    {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
            </TooltipTrigger>
            <TooltipContent>{isDarkMode ? t("Light") : t("Dark")}</TooltipContent>
        </Tooltip>
    </TooltipProvider>
);
