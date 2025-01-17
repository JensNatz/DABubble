export interface Message {
    id: string;
    content: string;
    timestamp: Date;
    isOwn: boolean;
    userId: string;
}
