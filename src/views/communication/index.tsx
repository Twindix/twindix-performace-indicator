import { useMemo } from "react";
import { AlertTriangle, Clock, Hash, MessageSquare, Mail, Video } from "lucide-react";

import { Badge, Card, CardContent, CardHeader, CardTitle } from "@/atoms";
import { AnimatedNumber, EmptyState, Header } from "@/components/shared";
import { t, useSettings } from "@/hooks";
import type { CommunicationChannel, CommunicationInterface, UserInterface } from "@/interfaces";
import { useSprintStore } from "@/store";
import { Avatar, AvatarFallback, Tabs, TabsList, TabsTrigger, TabsContent } from "@/ui";
import { cn, getStorageItem, storageKeys } from "@/utils";

const channelConfig: Record<CommunicationChannel, { label: string; icon: typeof MessageSquare; variant: "default" | "success" | "warning" | "error" | "secondary" | "outline" }> = {
    slack: { label: "Slack", icon: Hash, variant: "default" },
    email: { label: "Email", icon: Mail, variant: "secondary" },
    meeting: { label: "Meeting", icon: Video, variant: "success" },
    jira_comment: { label: "Jira", icon: MessageSquare, variant: "warning" },
};

const statusConfig: Record<string, { label: string; variant: "default" | "success" | "warning" | "error" | "secondary" | "outline" }> = {
    pending: { label: "Pending", variant: "warning" },
    answered: { label: "Answered", variant: "success" },
    escalated: { label: "Escalated", variant: "error" },
};

const hoursAgo = (dateStr: string): number => {
    const now = new Date();
    const date = new Date(dateStr);
    return Math.round((now.getTime() - date.getTime()) / (1000 * 60 * 60));
};

const formatTimeSince = (dateStr: string, lang: "en" | "ar"): string => {
    const hours = hoursAgo(dateStr);
    if (lang === "ar") {
        if (hours < 1) return "أقل من ساعة";
        if (hours < 24) return `منذ ${hours} ساعة`;
        const days = Math.floor(hours / 24);
        return `منذ ${days} يوم`;
    }
    if (hours < 1) return "< 1h ago";
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
};

export const CommunicationView = () => {
    const [settings] = useSettings();
    const compact = settings.compactView;
    const isRTL = settings.language === "ar";
    const { activeSprintId } = useSprintStore();
    const allComms = getStorageItem<CommunicationInterface[]>(storageKeys.communications) ?? [];
    const comms = allComms.filter((c) => c.sprintId === activeSprintId);
    const members = getStorageItem<UserInterface[]>(storageKeys.teamMembers) ?? [];

    const getMember = (id: string) => members.find((m) => m.id === id);

    const stats = useMemo(() => {
        const pending = comms.filter((c) => c.status === "pending");
        const answered = comms.filter((c) => c.status === "answered");
        const escalated = comms.filter((c) => c.status === "escalated");
        const avgResponseTime = answered.length > 0
            ? Math.round((answered.reduce((sum, c) => sum + (c.responseTimeHours ?? 0), 0) / answered.length) * 10) / 10
            : 0;

        return {
            total: comms.length,
            pending: pending.length,
            avgResponseTime,
            escalated: escalated.length,
        };
    }, [comms]);

    const pendingQuestions = useMemo(
        () => comms.filter((c) => c.status === "pending" || c.status === "escalated"),
        [comms],
    );

    const answeredQuestions = useMemo(
        () => comms.filter((c) => c.status === "answered").sort((a, b) => (b.responseTimeHours ?? 0) - (a.responseTimeHours ?? 0)),
        [comms],
    );

    const channelAvgResponse = useMemo(() => {
        const channels: CommunicationChannel[] = ["slack", "email", "meeting", "jira_comment"];
        return channels.map((channel) => {
            const answered = comms.filter((c) => c.channel === channel && c.status === "answered");
            const avg = answered.length > 0
                ? Math.round((answered.reduce((sum, c) => sum + (c.responseTimeHours ?? 0), 0) / answered.length) * 10) / 10
                : 0;
            return { channel, avg, count: answered.length };
        }).filter((c) => c.count > 0);
    }, [comms]);

    const maxChannelAvg = Math.max(...channelAvgResponse.map((c) => c.avg), 1);

    const fastestResponse = useMemo(() => {
        if (answeredQuestions.length === 0) return null;
        return answeredQuestions.reduce((min, c) => (c.responseTimeHours ?? Infinity) < (min.responseTimeHours ?? Infinity) ? c : min, answeredQuestions[0]);
    }, [answeredQuestions]);

    const slowestResponse = useMemo(() => {
        if (answeredQuestions.length === 0) return null;
        return answeredQuestions[0];
    }, [answeredQuestions]);

    if (comms.length === 0) {
        return (
            <div>
                <Header title={t("Communication Tracker")} description={t("Monitor response times and pending questions across channels")} />
                <EmptyState icon={MessageSquare} title={t("No Communications")} description={t("No communication data available for the current sprint")} />
            </div>
        );
    }

    return (
        <div>
            <Header title={t("Communication Tracker")} description={t("Monitor response times and pending questions across channels")} />

            {/* Stats Row */}
            <div className={cn("grid grid-cols-2 lg:grid-cols-4", compact ? "gap-2 mb-3" : "gap-4 mb-6")}>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-lighter">
                                <MessageSquare className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-text-dark"><AnimatedNumber value={stats.total} /></p>
                                <p className="text-xs text-text-muted">{t("Total Questions")}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning-light">
                                <Clock className="h-5 w-5 text-warning" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-warning"><AnimatedNumber value={stats.pending} /></p>
                                <p className="text-xs text-text-muted">{t("Pending")}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-lighter">
                                <Clock className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-text-dark"><AnimatedNumber value={stats.avgResponseTime} suffix="h" /></p>
                                <p className="text-xs text-text-muted">{t("Avg Response")}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-error-light">
                                <AlertTriangle className="h-5 w-5 text-error" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-error"><AnimatedNumber value={stats.escalated} /></p>
                                <p className="text-xs text-text-muted">{t("Escalated")}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="pending">
                <TabsList>
                    <TabsTrigger value="pending">{t("Pending Questions")}</TabsTrigger>
                    <TabsTrigger value="response-time">{t("Response Time Analysis")}</TabsTrigger>
                </TabsList>

                {/* Pending Questions Tab */}
                <TabsContent value="pending">
                    {pendingQuestions.length === 0 ? (
                        <Card className="mt-4">
                            <CardContent className="p-6">
                                <p className="text-sm text-text-muted text-center py-4">{t("No pending questions")}</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="flex flex-col gap-3 mt-4">
                            {pendingQuestions.map((q) => {
                                const askedBy = getMember(q.askedById);
                                const askedTo = getMember(q.askedToId);
                                const channel = channelConfig[q.channel];
                                const ChannelIcon = channel.icon;
                                const status = statusConfig[q.status];

                                return (
                                    <Card key={q.id}>
                                        <CardContent className="p-4">
                                            <p className="text-sm font-medium text-text-dark mb-3">{q.question}</p>
                                            <div className={cn("flex flex-wrap items-center gap-3", isRTL && "flex-row-reverse")}>
                                                {/* Asked by */}
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-6 w-6">
                                                        <AvatarFallback className="text-[8px]">{askedBy?.avatar}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-xs text-text-secondary">{askedBy?.name ?? "Unknown"}</span>
                                                </div>

                                                <span className="text-xs text-text-muted">-&gt;</span>

                                                {/* Asked to */}
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-6 w-6">
                                                        <AvatarFallback className="text-[8px]">{askedTo?.avatar}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-xs text-text-secondary">{askedTo?.name ?? "Unknown"}</span>
                                                </div>

                                                <Badge variant={channel.variant}>
                                                    <ChannelIcon className="h-3 w-3 me-1" />
                                                    {t(channel.label)}
                                                </Badge>

                                                <span className="text-xs text-text-muted">{formatTimeSince(q.askedAt, settings.language)}</span>

                                                <Badge variant={status.variant}>{t(status.label)}</Badge>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </TabsContent>

                {/* Response Time Analysis Tab */}
                <TabsContent value="response-time">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
                        {/* Answered Questions List */}
                        <div className="lg:col-span-2 flex flex-col gap-3">
                            <h3 className="text-sm font-semibold text-text-dark">{t("Answered Questions (slowest first)")}</h3>
                            {answeredQuestions.length === 0 ? (
                                <Card>
                                    <CardContent className="p-6">
                                        <p className="text-sm text-text-muted text-center py-4">{t("No answered questions yet")}</p>
                                    </CardContent>
                                </Card>
                            ) : (
                                answeredQuestions.map((q) => {
                                    const channel = channelConfig[q.channel];
                                    const ChannelIcon = channel.icon;
                                    const hours = q.responseTimeHours ?? 0;
                                    const responseColor = hours > 24 ? "text-error" : hours > 8 ? "text-warning" : "text-success";

                                    return (
                                        <Card key={q.id}>
                                            <CardContent className="p-4">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-text-dark truncate">{q.question}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Badge variant={channel.variant}>
                                                                <ChannelIcon className="h-3 w-3 me-1" />
                                                                {t(channel.label)}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <div className="text-right shrink-0">
                                                        <p className={cn("text-lg font-bold", responseColor)}>{hours}h</p>
                                                        <p className="text-xs text-text-muted">{t("response time")}</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })
                            )}
                        </div>

                        {/* Summary Sidebar */}
                        <div className="flex flex-col gap-4">
                            {/* Quick Stats */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">{t("Response Summary")}</CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-col gap-3">
                                    {fastestResponse && (
                                        <div className="flex items-start gap-3 rounded-xl bg-success-light p-3">
                                            <Clock className="h-4 w-4 text-success mt-0.5 shrink-0" />
                                            <div className="min-w-0">
                                                <p className="text-xs font-medium text-success">{t("Fastest Response")}</p>
                                                <p className="text-sm font-bold text-text-dark">{fastestResponse.responseTimeHours}h</p>
                                                <p className="text-xs text-text-muted truncate">{fastestResponse.question}</p>
                                            </div>
                                        </div>
                                    )}
                                    {slowestResponse && (
                                        <div className="flex items-start gap-3 rounded-xl bg-error-light p-3">
                                            <Clock className="h-4 w-4 text-error mt-0.5 shrink-0" />
                                            <div className="min-w-0">
                                                <p className="text-xs font-medium text-error">{t("Slowest Response")}</p>
                                                <p className="text-sm font-bold text-text-dark">{slowestResponse.responseTimeHours}h</p>
                                                <p className="text-xs text-text-muted truncate">{slowestResponse.question}</p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Channel Breakdown Bar Chart */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">{t("Avg Response by Channel")}</CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-col gap-3">
                                    {channelAvgResponse.length === 0 ? (
                                        <p className="text-sm text-text-muted text-center py-2">{t("No data")}</p>
                                    ) : (
                                        channelAvgResponse.map(({ channel, avg }) => {
                                            const config = channelConfig[channel];
                                            const ChannelIcon = config.icon;
                                            const barWidth = Math.round((avg / maxChannelAvg) * 100);
                                            const barColor = avg > 24 ? "bg-error" : avg > 8 ? "bg-warning" : "bg-success";

                                            return (
                                                <div key={channel}>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <div className="flex items-center gap-1.5">
                                                            <ChannelIcon className="h-3.5 w-3.5 text-text-muted" />
                                                            <span className="text-xs font-medium text-text-secondary">{t(config.label)}</span>
                                                        </div>
                                                        <span className="text-xs font-bold text-text-dark">{avg}h</span>
                                                    </div>
                                                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                                                        <div
                                                            className={cn("h-full rounded-full transition-all duration-500 progress-animated", barColor)}
                                                            style={{ width: `${barWidth}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};
