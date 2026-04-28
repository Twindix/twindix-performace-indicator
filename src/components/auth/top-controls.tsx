import { Globe, Moon, Sun } from "lucide-react";

import { Button } from "@/atoms";
import type { LoginTopControlsPropsInterface } from "@/interfaces";

export const LoginTopControls = ({
    isArabic,
    isDarkMode,
    onToggleLanguage,
    onToggleTheme,
}: LoginTopControlsPropsInterface) => (
    <div className="flex items-center justify-center gap-1 mb-4">
        <Button
            variant="ghost"
            size="sm"
            onClick={onToggleLanguage}
            className="h-9 gap-1.5 text-xs font-semibold px-3"
        >
            <Globe className="h-4 w-4" />
            {isArabic ? "EN" : "عربي"}
        </Button>
        <Button variant="ghost" size="icon" onClick={onToggleTheme} className="h-9 w-9">
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
    </div>
);
