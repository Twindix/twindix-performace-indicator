import { useEffect, useState } from "react";
import { Calendar, Users } from "lucide-react";

import { Skeleton } from "@/atoms";
import { t } from "@/utils";
import { useGetTeam } from "@/hooks";
import type { TeamInterface } from "@/interfaces";
import { Avatar, AvatarFallback, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/ui";
import { formatDate } from "@/utils";

interface TeamDetailDialogProps {
    teamId: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const TeamDetailDialog = ({ teamId, open, onOpenChange }: TeamDetailDialogProps) => {
    const { getHandler, isLoading } = useGetTeam();
    const [team, setTeam] = useState<TeamInterface | null>(null);

    useEffect(() => {
        if (!open || !teamId) { setTeam(null); return; }
        getHandler(teamId).then((res) => { if (res) setTeam(res); });
    }, [open, teamId, getHandler]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-lighter text-primary-medium shrink-0">
                            <Users className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            {isLoading && !team ? (
                                <>
                                    <Skeleton className="h-5 w-40 mb-1" />
                                    <Skeleton className="h-3 w-24" />
                                </>
                            ) : (
                                <>
                                    <DialogTitle className="text-lg">{team?.name ?? "—"}</DialogTitle>
                                    <DialogDescription>
                                        {team?.member_count ?? 0} {t("members")}
                                    </DialogDescription>
                                </>
                            )}
                        </div>
                    </div>
                </DialogHeader>

                <div className="mt-4 space-y-4">
                    {team?.description && (
                        <p className="text-sm text-text-secondary">{team.description}</p>
                    )}

                    {team?.created_at && (
                        <div className="flex items-center gap-2 text-xs text-text-muted">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{t("Created")}: {formatDate(team.created_at)}</span>
                        </div>
                    )}

                    <div>
                        <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">{t("Members")}</p>
                        {isLoading && !team ? (
                            <div className="space-y-2">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted">
                                        <Skeleton className="h-7 w-7 rounded-full shrink-0" />
                                        <Skeleton className="h-3 w-32" />
                                    </div>
                                ))}
                            </div>
                        ) : !team || (team.members?.length ?? 0) === 0 ? (
                            <p className="text-xs text-text-muted italic">{t("No members yet")}</p>
                        ) : (
                            <div className="space-y-1.5 max-h-60 overflow-y-auto">
                                {team.members!.map((m) => (
                                    <div key={m.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted">
                                        <Avatar className="h-7 w-7 shrink-0">
                                            <AvatarFallback className="text-[10px]">{m.avatar_initials}</AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm text-text-dark truncate">{m.full_name}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
