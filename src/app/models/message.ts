export interface Message {
    id?: string;
    content: string;
    timestamp: number;
    author: string;
    channelId: string;
    edited: boolean;
    numberOfReplies?: number;
    lastReplyTimestamp?: number;
    parentMessageId?: string;
    reactions?: [];
}
