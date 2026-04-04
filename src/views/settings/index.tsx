import { useState } from "react";
import { Bell, Calendar, Globe, Lock, Moon, Palette, Save, Sun } from "lucide-react";
import { toast } from "sonner";

import { Button, Card, CardContent, Input, Label } from "@/atoms";
import { Header } from "@/components/shared";
import { useAuth, useTheme, useSettings, t, type AppSettings } from "@/hooks";
import { Checkbox, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui";

export const SettingsView = () => {
    const { user, onUpdateUser } = useAuth();
    const { isDarkMode, onToggleTheme } = useTheme();
    const [settings, updateSettings] = useSettings();
    const [displayName, setDisplayName] = useState(user?.name ?? "");

    const updateNotification = (key: keyof AppSettings["notifications"], value: boolean) => {
        updateSettings({ notifications: { ...settings.notifications, [key]: value } });
        const label = key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
        toast(value ? `${label} enabled` : `${label} disabled`, { description: value ? "You will receive notifications for this event." : "Notifications for this event are now off." });
    };

    const handleSaveAccount = () => {
        if (!displayName.trim()) {
            toast.error("Display name cannot be empty");
            return;
        }
        onUpdateUser({ name: displayName.trim() });
        toast.success("Display name updated", { description: `Your name is now "${displayName.trim()}"` });
    };

    if (!user) return null;

    return (
        <div>
            <Header title={t("Settings")} description={t("Manage your account preferences and platform settings")} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
                {/* Appearance */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Palette className="h-5 w-5 text-primary" />
                            <h3 className="text-base font-semibold text-text-dark">{t("Appearance")}</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-text-dark">{t("Dark Mode")}</p>
                                    <p className="text-xs text-text-muted">{t("Switch between light and dark theme")}</p>
                                </div>
                                <Button variant="outline" size="sm" onClick={onToggleTheme} className="gap-2">
                                    {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                                    {isDarkMode ? t("Light") : t("Dark")}
                                </Button>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-text-dark">{t("Compact View")}</p>
                                    <p className="text-xs text-text-muted">{t("Reduce spacing in lists and tables")}</p>
                                </div>
                                <Checkbox checked={settings.compactView} onCheckedChange={(checked) => updateSettings({ compactView: !!checked })} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Notifications */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Bell className="h-5 w-5 text-primary" />
                            <h3 className="text-base font-semibold text-text-dark">{t("Notifications")}</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-text-dark">{t("Blocker Alerts")}</p>
                                    <p className="text-xs text-text-muted">{t("Get notified when a task is blocked")}</p>
                                </div>
                                <Checkbox checked={settings.notifications.blockerAlerts} onCheckedChange={(v) => updateNotification("blockerAlerts", !!v)} />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-text-dark">{t("SLA Breaches")}</p>
                                    <p className="text-xs text-text-muted">{t("Alert when response time exceeds SLA")}</p>
                                </div>
                                <Checkbox checked={settings.notifications.slaBreaches} onCheckedChange={(v) => updateNotification("slaBreaches", !!v)} />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-text-dark">{t("Sprint Summary")}</p>
                                    <p className="text-xs text-text-muted">{t("Daily sprint health digest")}</p>
                                </div>
                                <Checkbox checked={settings.notifications.sprintSummary} onCheckedChange={(v) => updateNotification("sprintSummary", !!v)} />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-text-dark">{t("Decision Updates")}</p>
                                    <p className="text-xs text-text-muted">{t("Notify when decisions are approved")}</p>
                                </div>
                                <Checkbox checked={settings.notifications.decisionUpdates} onCheckedChange={(v) => updateNotification("decisionUpdates", !!v)} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Account */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Lock className="h-5 w-5 text-primary" />
                            <h3 className="text-base font-semibold text-text-dark">{t("Account")}</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="display-name">{t("Display Name")}</Label>
                                <Input id="display-name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>{t("Email")}</Label>
                                <Input value={user.email} disabled />
                            </div>
                            <div className="space-y-2">
                                <Label>{t("Role")}</Label>
                                <Input defaultValue={user.role.replace(/_/g, " ")} disabled className="capitalize" />
                            </div>
                            <Button onClick={handleSaveAccount} className="w-full gap-2">
                                <Save className="h-4 w-4" />
                                {t("Save Changes")}
                            </Button>
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
                                <Select value={settings.language} onValueChange={(v) => updateSettings({ language: v as "en" | "ar" })}>
                                    <SelectTrigger className="w-[130px] h-8 text-xs rounded-full bg-primary-lighter text-primary-medium border-none font-medium">
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
                                <Select value={settings.dateFormat} onValueChange={(v) => updateSettings({ dateFormat: v as AppSettings["dateFormat"] })}>
                                    <SelectTrigger className="w-[140px] h-8 text-xs rounded-full bg-primary-lighter text-primary-medium border-none font-medium">
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
            </div>
        </div>
    );
};
