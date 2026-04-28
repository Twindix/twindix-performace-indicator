import { Briefcase, Calendar, Mail, Pencil, Shield, Users } from "lucide-react";
import { useState } from "react";

import { Badge, Button, Card, CardContent, Input } from "@/atoms";
import { Header } from "@/components/shared";
import { ProfileSkeleton } from "@/components/skeletons";
import { t, useAuth, usePageLoader, usePermissions, useUpdateMe, useUpdateUser } from "@/hooks";
import { Avatar, AvatarFallback } from "@/ui";

export const ProfileView = () => {
    const isLoading = usePageLoader();
    const p = usePermissions();
    const canEditProfile = p.auth.editProfile();
    const { user } = useAuth();
    const { onUpdateUser } = useUpdateUser();
    const { updateHandler, isLoading: isSaving } = useUpdateMe();
    const [isEditingName, setIsEditingName] = useState(false);
    const [editedName, setEditedName] = useState(user?.full_name ?? "");

    const handleSaveName = async () => {
        if (!editedName.trim()) return;
        const updated = await updateHandler({ full_name: editedName.trim() });
        if (updated) {
            onUpdateUser(updated);
            setIsEditingName(false);
        }
    };

    if (!user) return null;
    if (isLoading) return <ProfileSkeleton />;

    return (
        <div>
            <Header title={t("My Profile")} description={t("Your account details")} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:row-span-2">
                    <CardContent className="p-6 flex flex-col items-center text-center">
                        <Avatar className="h-20 w-20 sm:h-24 sm:w-24 mb-4">
                            <AvatarFallback className="text-2xl font-bold">{user.avatar_initials}</AvatarFallback>
                        </Avatar>

                        {isEditingName ? (
                            <div className="flex items-center gap-2 mt-1">
                                <Input
                                    autoFocus
                                    value={editedName}
                                    onChange={(e) => setEditedName(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") handleSaveName();
                                        if (e.key === "Escape") { setEditedName(user.full_name ?? ""); setIsEditingName(false); }
                                    }}
                                    className="text-xl font-bold text-center h-9"
                                />
                                <Button size="sm" onClick={handleSaveName} loading={isSaving} disabled={!editedName.trim()}>{t("Save")}</Button>
                                <Button size="sm" variant="outline" onClick={() => { setEditedName(user.full_name ?? ""); setIsEditingName(false); }}>{t("Cancel")}</Button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-bold text-text-dark">{user.full_name}</h2>
                                {canEditProfile && (
                                    <button onClick={() => { setEditedName(user.full_name ?? ""); setIsEditingName(true); }} className="text-text-muted hover:text-text-dark transition-colors cursor-pointer" aria-label="Edit name">
                                        <Pencil className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        )}

                        <p className="text-sm text-primary font-medium mt-1">{user.role_label}</p>
                        <Badge variant="default" className="mt-2">{((user.team as any)?.name ?? "")} {t("Team")}</Badge>

                        <div className="w-full mt-6 space-y-3">
                            <div className="flex items-center gap-3 text-sm text-text-secondary">
                                <Mail className="h-4 w-4 text-text-muted" />
                                <span>{user.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-text-secondary">
                                <Briefcase className="h-4 w-4 text-text-muted" />
                                <span>{user.role_label}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-text-secondary">
                                <Users className="h-4 w-4 text-text-muted" />
                                <span>{((user.team as any)?.name ?? "")} {t("Team")}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-text-secondary">
                                <Calendar className="h-4 w-4 text-text-muted" />
                                <span>{t("Joined")} {user.created_at ? new Date(user.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : ""}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-text-secondary">
                                <Shield className="h-4 w-4 text-text-muted" />
                                <span>{user.account_status}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
