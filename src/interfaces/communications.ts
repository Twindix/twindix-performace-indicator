export type CommunicationChannel = "slack" | "email" | "meeting" | "jira_comment";
export type CommunicationStatus = "pending" | "answered" | "escalated";

export interface CommunicationInterface {
    id: string;
    question: string;
    askedById: string;
    askedToId: string;
    channel: CommunicationChannel;
    status: CommunicationStatus;
    askedAt: string;
    answeredAt?: string;
    responseTimeHours?: number;
    sprintId: string;
}
