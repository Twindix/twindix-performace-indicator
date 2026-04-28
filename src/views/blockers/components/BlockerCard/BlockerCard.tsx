import { Card, CardContent } from "@/atoms";
import type { BlockerCardPropsInterface } from "@/interfaces";

import { BlockerCardHeader } from "./BlockerCardHeader";
import { BlockerCardMeta } from "./BlockerCardMeta";

export const BlockerCard = ({ blocker, compact, onClick }: BlockerCardPropsInterface) => (
    <Card
        className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
        onClick={onClick}
    >
        <CardContent className={compact ? "p-3" : "p-5"}>
            <BlockerCardHeader
                type={blocker.type}
                title={blocker.title}
                description={blocker.description}
                status={blocker.status}
                severity={blocker.severity}
            />
            <BlockerCardMeta
                reporter={blocker.reporter}
                owner={blocker.owner}
                durationDays={blocker.duration_days}
                createdAt={blocker.created_at}
                tasksAffected={blocker.tasks_affected}
            />
        </CardContent>
    </Card>
);
