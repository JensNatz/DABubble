export interface MessagePart {
  type: 'text' | 'user' | 'channel';
  content?: string;
  id?: string;
  displayName?: string;
  available?: boolean;
}
