export interface Message {
    id: string;
    content: string;
    timestamp: number;
    isOwn: boolean;
    userId: string;
}
