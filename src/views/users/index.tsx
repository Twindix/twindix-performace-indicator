import { useEffect, useState } from "react";
import { ArrowRight, MoreHorizontal, Plus, PowerOff, Trash2, UserCog, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Badge, Button, Card, CardContent, Input, Label } from "@/atoms";
import { EmptyState, Header, QueryBoundary } from "@/components/shared";
import { UsersSkeleton } from "@/components/skeletons";
import { t } from "@/hooks";
import type { UserInterface } from "@/interfaces";
import { useUsersList, useUsersCreate, useUsersUpdate } from "@/hooks/users";
import {
    Avatar, AvatarFallback,
    Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle,
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/ui";
import { apisData } from "@/data";
import { apiClient } from "@/lib/axios";

interface TeamOption { id: string; name: string; }

const ROLE_TIERS = ["admin", "manager", "member"] as const;

const emptyForm = {
    full_name: "",
    email: "",
    password: "",
    role_label: "",
    role_tier: "member" as string,
    team_id: "",
    avatar_initials: "",
};

type FormState = typeof emptyForm;
type FormErrors = Partial<Record<keyof FormState, string>>;

export const UsersView = () => {
    const navigate = useNavigate();
    const { users, isLoading, refetch, patchUserLocal } = useUsersList();

    const [errors, setErrors] = useState<FormErrors>({});
    const mapFieldErrors = (fe: Record<string, string[]>) => {
        const mapped: FormErrors = {};
        for (const key of Object.keys(fe)) mapped[key as keyof FormState] = fe[key]?.[0];
        setErrors(mapped);
    };

    const { create, isLoading: isCreating } = useUsersCreate({ onFieldErrors: mapFieldErrors });
    const { update: updateUser } = useUsersUpdate({ onFieldErrors: mapFieldErrors });

    const [teams, setTeams] = useState<TeamOption[]>([]);
    const [addOpen, setAddOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<UserInterface | null>(null);
    const [form, setForm] = useState<FormState>(emptyForm);

    useEffect(() => {
        apiClient.get<{ data: TeamOption[] }>(apisData.teams.list)
            .then((res) => setTeams(res.data.data ?? []))
            .catch(() => {});
    }, []);

    const set = (field: keyof FormState, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => {
            if (!(field in prev)) return prev;
            const next = { ...prev };
            delete next[field];
            return next;
        });
    };

    const validate = (): boolean => {
        const e: FormErrors = {};
        if (!form.full_name.trim())  e.full_name  = t("Required");
        if (!form.email.trim())      e.email      = t("Required");
        if (!form.password.trim())   e.password   = t("Required");
        if (!form.role_label.trim()) e.role_label = t("Required");
        if (!form.team_id)           e.team_id    = t("Required");
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleAdd = async () => {
        if (!validate()) return;
        const initials = form.avatar_initials.trim() ||
            form.full_name.trim().split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

        const created = await create({
            full_name:       form.full_name.trim(),
            email:           form.email.trim(),
            password:        form.password,
            role_label:      form.role_label.trim(),
            role_tier:       form.role_tier,
            team_id:         form.team_id,
            avatar_initials: initials,
        });

        if (created) {
            setAddOpen(false);
            setForm(emptyForm);
            setErrors({});
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

            <QueryBoundary
                isLoading={isLoading}
                skeleton={<UsersSkeleton />}
                empty={users.length === 0}
                emptyState={<EmptyState icon={UserCog} title={t("No Users")} description={t("Add team members to get started")} />}
            >
                <div className="flex flex-col gap-3">
                    {users.map((member) => {
                        const isInactive = member.account_status === "inactive";
                        const teamName = typeof member.team === "string" ? member.team : member.team?.name;
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
                                                <Badge variant="outline" className="text-xs">{member.role_label}</Badge>
                                                {teamName && <Badge variant="secondary" className="text-xs">{teamName}</Badge>}
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
                                                        onClick={async () => {
                                                            const next = isInactive ? "active" : "inactive";
                                                            const optimistic = { ...member, account_status: next as UserInterface["account_status"] };
                                                            patchUserLocal(optimistic);
                                                            const res = await updateUser(member.id, { account_status: next });
                                                            if (res) {
                                                                patchUserLocal(res as UserInterface);
                                                                toast.success(t(isInactive ? "User activated" : "User deactivated"));
                                                            } else {
                                                                patchUserLocal(member);
                                                            }
                                                        }}
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
                                                        <Trash2 className="h-4 w-4" />{t("Delete")}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                            <button
                                                onClick={() => navigate(`/users/${member.id}`)}
                                                className="p-1.5 rounded-md text-text-muted hover:text-primary hover:bg-primary-lighter transition-colors cursor-pointer"
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
            </QueryBoundary>

            {/* ── Add User Dialog ── */}
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
                                <Input id="u-name" value={form.full_name} onChange={(e) => set("full_name", e.target.value)} placeholder="John Doe" className={errors.full_name ? "border-error" : ""} />
                                {errors.full_name && <p className="text-xs text-error">{errors.full_name}</p>}
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="u-email">{t("Email")}</Label>
                                <Input id="u-email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="john@company.com" className={errors.email ? "border-error" : ""} />
                                {errors.email && <p className="text-xs text-error">{errors.email}</p>}
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="u-password">{t("Password")}</Label>
                            <Input id="u-password" type="password" value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="••••••••" className={errors.password ? "border-error" : ""} />
                            {errors.password && <p className="text-xs text-error">{errors.password}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="u-role-label">{t("Role Title")}</Label>
                                <Input id="u-role-label" value={form.role_label} onChange={(e) => set("role_label", e.target.value)} placeholder="Frontend Engineer" className={errors.role_label ? "border-error" : ""} />
                                {errors.role_label && <p className="text-xs text-error">{errors.role_label}</p>}
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label>{t("Role Tier")}</Label>
                                <Select value={form.role_tier} onValueChange={(v) => set("role_tier", v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {ROLE_TIERS.map((r) => <SelectItem key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <Label>{t("Team")}</Label>
                                <Select value={form.team_id} onValueChange={(v) => set("team_id", v)}>
                                    <SelectTrigger className={errors.team_id ? "border-error" : ""}><SelectValue placeholder={t("Select team")} /></SelectTrigger>
                                    <SelectContent>
                                        {teams.map((tm) => <SelectItem key={tm.id} value={tm.id}>{tm.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                {errors.team_id && <p className="text-xs text-error">{errors.team_id}</p>}
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="u-avatar">{t("Avatar Initials")} <span className="text-text-muted text-xs">({t("optional")})</span></Label>
                                <Input id="u-avatar" value={form.avatar_initials} onChange={(e) => set("avatar_initials", e.target.value.toUpperCase().slice(0, 2))} placeholder="JD" maxLength={2} />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-2">
                        <DialogClose asChild><Button variant="outline" disabled={isCreating}>{t("Cancel")}</Button></DialogClose>
                        <Button onClick={handleAdd} loading={isCreating}>{t("Add Member")}</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ── Delete Confirm ── */}
            <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader><DialogTitle className="text-error">{t("Remove User")}</DialogTitle></DialogHeader>
                    <p className="text-sm text-text-secondary py-2">
                        {t("Are you sure you want to remove")} <span className="font-semibold text-text-dark">{deleteTarget?.full_name}</span>? {t("This cannot be undone.")}
                    </p>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setDeleteTarget(null)}>{t("Cancel")}</Button>
                        <Button variant="destructive" onClick={() => setDeleteTarget(null)}>{t("Remove")}</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};
