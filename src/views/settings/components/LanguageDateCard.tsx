import { Calendar, Globe } from "lucide-react";

import { Card, CardContent } from "@/atoms";
import { settingsConstants } from "@/constants";
import { t } from "@/hooks";
import type { AppSettings } from "@/hooks";
import type { LanguageDateCardPropsInterface } from "@/interfaces/settings";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui";

export const LanguageDateCard = ({
    language,
    dateFormat,
    onLanguageChange,
    onDateFormatChange,
}: LanguageDateCardPropsInterface) => (
    <Card>
        <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
                <Globe className="h-5 w-5 text-primary" />
                <h3 className="text-base font-semibold text-text-dark">{t("Language & Date")}</h3>
            </div>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-text-dark">{t("Language")}</p>
                        <p className="text-xs text-text-muted">{t("Interface language")}</p>
                    </div>
                    <Select
                        value={language ?? undefined}
                        onValueChange={(v) => onLanguageChange(v as AppSettings["language"])}
                    >
                        <SelectTrigger className="w-full sm:w-[130px] h-8 text-xs rounded-full bg-primary-lighter text-primary-medium border-none font-medium">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {settingsConstants.languageOptions.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-text-dark flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-text-muted" />
                            {t("Date Format")}
                        </p>
                        <p className="text-xs text-text-muted">{t("How dates are displayed")}</p>
                    </div>
                    <Select
                        value={dateFormat ?? undefined}
                        onValueChange={(v) => onDateFormatChange(v as AppSettings["dateFormat"])}
                    >
                        <SelectTrigger className="w-full sm:w-[140px] h-8 text-xs rounded-full bg-primary-lighter text-primary-medium border-none font-medium">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {settingsConstants.dateFormatOptions.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </CardContent>
    </Card>
);
