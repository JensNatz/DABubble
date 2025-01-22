export interface Message {
    id?: string;
    content: string;
    timestamp: number;
    author: string;
    channelId: string;
    reactions?: [];
}
