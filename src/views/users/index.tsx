import { useState } from "react";
import { ArrowRight, MoreHorizontal, Plus, PowerOff, Trash2, UserCog, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Badge, Button, Card, CardContent, Input, Label } from "@/atoms";
import { EmptyState, Header } from "@/components/shared";
import { t } from "@/hooks";
import { useUsersCreate, useUsersDelete, useUsersList, useUsersUpdate } from "@/hooks/users";
import type { UserInterface } from "@/interfaces";
import type { CreateUserPayloadInterface } from "@/interfaces/users";
import {
    Avatar, AvatarFallback,
    Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle,
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/ui";

const ROLE_TIER_OPTIONS = ["admin", "manager", "member"];

const TEAM_OPTIONS = [
    { id: "019daa15-922d-72f7-b32c-c46395d79800", name: "Frontend" },
    { id: "019daa15-9232-710b-8c3b-2212825a815f", name: "Backend" },
    { id: "019daa15-9233-7310-b216-3b70cca353dc", name: "Leadership" },
    { id: "019daa15-9234-735e-af84-363a86c94b51", name: "HR" },
    { id: "019daa15-9236-7098-9d16-338df3251d74", name: "Product" },
    { id: "019daa15-9237-739d-8578-e91a39547032", name: "QA" },
    { id: "019daa15-923c-7055-909e-8ee7bfbf3411", name: "AI" },
    { id: "019daa15-923c-7055-909e-8ee7bff44e7a", name: "Data" },
    { id: "019daa15-923d-7058-a8a7-d25ccbfcae9d", name: "Design" },
];

const emptyForm = { full_name: "", email: "", password: "", role_tier: "member", team_id: TEAM_OPTIONS[0].id };

export const UsersView = () => {
    const navigate = useNavigate();
    const { users, isLoading, refetch } = useUsersList();
    const { create, isLoading: creating } = useUsersCreate();
    const { update } = useUsersUpdate();
    const { remove } = useUsersDelete();

    const [addOpen, setAddOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<UserInterface | null>(null);
    const [deactivateTarget, setDeactivateTarget] = useState<UserInterface | null>(null);
    const [form, setForm] = useState<CreateUserPayloadInterface>(emptyForm);
    const [errors, setErrors] = useState<Partial<Record<keyof CreateUserPayloadInterface, string>>>({});

    const validate = () => {
        const e: Partial<Record<keyof CreateUserPayloadInterface, string>> = {};
        if (!form.full_name.trim()) e.full_name = t("Required");
        if (!form.email.trim()) e.email = t("Required");
        if (!form.password.trim()) e.password = t("Required");
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleAdd = async () => {
        if (!validate()) return;
        const newUser = await create(form);
        if (newUser) {
            setAddOpen(false);
            setForm(emptyForm);
            refetch();
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        const ok = await remove(deleteTarget.id);
        if (ok) {
            setDeleteTarget(null);
            refetch();
        }
    };

    const handleToggleActive = async () => {
        if (!deactivateTarget) return;
        const isActive = deactivateTarget.account_status !== "inactive";
        const updated = await update(deactivateTarget.id, { account_status: isActive ? "inactive" : "active" });
        if (updated) {
            setDeactivateTarget(null);
            refetch();
        }
    };

    return (
        <div>
            <Header title={t("User Management")} description={t("Manage team members and view individual performance analytics")} />

            <div className="flex justify-end mb-6">
                <Button onClick={() => { setForm(emptyForm); setErrors({}); setAddOpen(true); }} className="gap-2">
                    <Plus className="h-4 w-4" />
                    {t("Add User")}
                </Button>
            </div>

            {isLoading ? (
                <div className="flex flex-col gap-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Card key={i}><CardContent className="p-4"><div className="h-10 bg-muted animate-pulse rounded-lg" /></CardContent></Card>
                    ))}
                </div>
            ) : users.length === 0 ? (
                <EmptyState icon={UserCog} title={t("No Users")} description={t("No team members found")} />
            ) : (
                <div className="flex flex-col gap-3">
                    {users.map((member) => {
                        const isInactive = member.account_status === "inactive";
                        return (
                            <Card key={member.id} className={`hover:shadow-md transition-shadow ${isInactive ? "opacity-60" : ""}`}>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-10 w-10 shrink-0">
                                            <AvatarFallback className="text-sm font-semibold">{member.avatar_initials}</AvatarFallback>
                                        </Avatar>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="text-sm font-semibold text-text-dark">{member.full_name}</p>
                                                {member.role_label && <Badge variant="outline" className="text-xs">{member.role_label}</Badge>}
                                                <Badge variant="secondary" className="text-xs">{member.team.name}</Badge>
                                                {isInactive && <Badge variant="error" className="text-xs">{t("Inactive")}</Badge>}
                                            </div>
                                            <p className="text-xs text-text-muted mt-0.5">{member.email}</p>
                                        </div>

                                        <div className="flex items-center gap-1 shrink-0">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button className="p-1.5 rounded-md text-text-muted hover:text-text-dark hover:bg-accent transition-colors cursor-pointer">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-44">
                                                    <DropdownMenuItem
                                                        className="gap-2 cursor-pointer"
                                                        onClick={() => setDeactivateTarget(member)}
                                                    >
                                                        {isInactive
                                                            ? <><Zap className="h-4 w-4 text-success" />{t("Activate")}</>
                                                            : <><PowerOff className="h-4 w-4 text-warning" />{t("Deactivate")}</>
                                                        }
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="gap-2 text-error focus:text-error cursor-pointer"
                                                        onClick={() => setDeleteTarget(member)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        {t("Delete")}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>

                                            <button
                                                onClick={() => navigate(`/users/${member.id}`)}
                                                className="p-1.5 rounded-md text-text-muted hover:text-primary hover:bg-primary-lighter transition-colors cursor-pointer"
                                                aria-label="View analytics"
                                            >
                                                <ArrowRight className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Add Dialog */}
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <UserCog className="h-5 w-5 text-primary" />
                            {t("Add Team Member")}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 py-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="u-name">{t("Full Name")}</Label>
                                <Input id="u-name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="John Doe" className={errors.full_name ? "border-error" : ""} />
                                {errors.full_name && <p className="text-xs text-error">{errors.full_name}</p>}
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="u-email">{t("Email")}</Label>
                                <Input id="u-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="john@company.com" className={errors.email ? "border-error" : ""} />
                                {errors.email && <p className="text-xs text-error">{errors.email}</p>}
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="u-password">{t("Password")}</Label>
                            <Input id="u-password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" className={errors.password ? "border-error" : ""} />
                            {errors.password && <p className="text-xs text-error">{errors.password}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <Label>{t("Role Tier")}</Label>
                                <Select value={form.role_tier} onValueChange={(v) => setForm({ ...form, role_tier: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {ROLE_TIER_OPTIONS.map((tier) => (
                                            <SelectItem key={tier} value={tier}>{tier.charAt(0).toUpperCase() + tier.slice(1)}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label>{t("Team")}</Label>
                                <Select value={form.team_id} onValueChange={(v) => setForm({ ...form, team_id: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {TEAM_OPTIONS.map((team) => (
                                            <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-2">
                        <DialogClose asChild><Button variant="outline">{t("Cancel")}</Button></DialogClose>
                        <Button onClick={handleAdd} disabled={creating}>{creating ? t("Adding...") : t("Add Member")}</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Deactivate / Activate Confirm */}
            <Dialog open={!!deactivateTarget} onOpenChange={(o) => !o && setDeactivateTarget(null)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className={deactivateTarget?.account_status === "inactive" ? "text-success" : "text-warning"}>
                            {deactivateTarget?.account_status === "inactive" ? t("Activate User") : t("Deactivate User")}
                        </DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-text-secondary py-2">
                        {deactivateTarget?.account_status === "inactive"
                            ? <>{t("Activate")} <span className="font-semibold text-text-dark">{deactivateTarget?.full_name}</span>? {t("They will regain access to the platform.")}</>
                            : <>{t("Deactivate")} <span className="font-semibold text-text-dark">{deactivateTarget?.full_name}</span>? {t("They will lose access until reactivated.")}</>
                        }
                    </p>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setDeactivateTarget(null)}>{t("Cancel")}</Button>
                        <Button
                            variant={deactivateTarget?.account_status === "inactive" ? "default" : "outline"}
                            className={deactivateTarget?.account_status !== "inactive" ? "border-warning text-warning hover:bg-warning-light" : ""}
                            onClick={handleToggleActive}
                        >
                            {deactivateTarget?.account_status === "inactive" ? t("Activate") : t("Deactivate")}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirm */}
            <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader><DialogTitle className="text-error">{t("Remove User")}</DialogTitle></DialogHeader>
                    <p className="text-sm text-text-secondary py-2">
                        {t("Are you sure you want to remove")} <span className="font-semibold text-text-dark">{deleteTarget?.full_name}</span>? {t("This cannot be undone.")}
                    </p>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setDeleteTarget(null)}>{t("Cancel")}</Button>
                        <Button variant="destructive" onClick={handleDelete}>{t("Remove")}</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};
