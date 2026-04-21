import { Calendar, Globe, Info, Minimize2, Moon, Sun } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent } from "@/atoms";
import type { UserSettingsInterface } from "@/interfaces";
import { Header } from "@/components/shared";
import { SettingsSkeleton } from "@/components/skeletons";
import { useAuth, useTheme, t, usePageLoader, type AppSettings } from "@/hooks";
import { handleApiError } from "@/lib/error";
import { authService } from "@/services";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui";

export const SettingsView = () => {
    const isLoading = usePageLoader();
    const { user, onUpdateUser } = useAuth();
    const { isDarkMode, onToggleTheme } = useTheme();

    const updateSetting = async (patch: Partial<NonNullable<typeof user>["settings"]>) => {
        if (!user) return;
        const updated = { ...(user!.settings ?? {}), ...patch } as UserSettingsInterface;
        try {
            const result = await authService.updateMeHandler({ settings: updated });
            onUpdateUser(result);
        } catch (err) {
            toast.error(handleApiError(err).message);
        }
    };

    if (!user) return null;
    if (isLoading) return <SettingsSkeleton />;

    const { compact_view, language, date_format } = user.settings ?? {};

    return (
        <div>
            <Header title={t("Settings")} description={t("Manage your account preferences and platform settings")} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
                {/* Appearance */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Sun className="h-5 w-5 text-primary" />
                            <h3 className="text-base font-semibold text-text-dark">{t("Appearance")}</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-text-dark">{t("Dark Mode")}</p>
                                    <p className="text-xs text-text-muted">{t("Switch between light and dark theme")}</p>
                                </div>
                                <button
                                    onClick={() => { onToggleTheme(); updateSetting({ dark_mode: !isDarkMode }); }}
                                    className={`relative inline-flex h-8 w-[52px] shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors duration-300 ease-in-out ${isDarkMode ? "bg-primary border-primary" : "bg-muted border-muted"}`}
                                >
                                    <span className={`pointer-events-none inline-flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md ring-0 transition-transform duration-300 ease-in-out ${isDarkMode ? "translate-x-[22px] rtl:-translate-x-[22px]" : "translate-x-[2px] rtl:-translate-x-[2px]"}`}>
                                        {isDarkMode ? <Moon className="h-3.5 w-3.5 text-primary" /> : <Sun className="h-3.5 w-3.5 text-amber-500" />}
                                    </span>
                                </button>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-text-dark">{t("Compact View")}</p>
                                    <p className="text-xs text-text-muted">{t("Reduce spacing in lists and tables")}</p>
                                </div>
                                <button
                                    onClick={() => updateSetting({ compact_view: !compact_view })}
                                    className={`relative inline-flex h-8 w-[52px] shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors duration-300 ease-in-out ${compact_view ? "bg-primary border-primary" : "bg-muted border-muted"}`}
                                >
                                    <span className={`pointer-events-none inline-flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md ring-0 transition-transform duration-300 ease-in-out ${compact_view ? "translate-x-[22px] rtl:-translate-x-[22px]" : "translate-x-[2px] rtl:-translate-x-[2px]"}`}>
                                        <Minimize2 className={`h-3.5 w-3.5 ${compact_view ? "text-primary" : "text-text-muted"}`} />
                                    </span>
                                </button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Language & Date */}
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
                                <Select value={language} onValueChange={(v) => updateSetting({ language: v as "en" | "ar" })}>
                                    <SelectTrigger className="w-full sm:w-[130px] h-8 text-xs rounded-full bg-primary-lighter text-primary-medium border-none font-medium">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="en">English</SelectItem>
                                        <SelectItem value="ar">العربية</SelectItem>
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
                                <Select value={date_format} onValueChange={(v) => updateSetting({ date_format: v as AppSettings["dateFormat"] })}>
                                    <SelectTrigger className="w-full sm:w-[140px] h-8 text-xs rounded-full bg-primary-lighter text-primary-medium border-none font-medium">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MMM D, YYYY">MMM D, YYYY</SelectItem>
                                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* About */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Info className="h-5 w-5 text-primary" />
                            <h3 className="text-base font-semibold text-text-dark">{t("About the App")}</h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-text-dark">{t("Application")}</p>
                                <p className="text-sm text-text-secondary">{t("Twindix Performance Indicator")}</p>
                            </div>
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-text-dark">{t("Version")}</p>
                                <p className="text-sm text-text-secondary font-mono">0.1.0</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
