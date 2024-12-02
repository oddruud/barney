export interface ChatMessage {
  id: string;
  walkId: string;
  timestamp: string;
  userId: number;
  userName: string;
  message: string;
  newMessage: boolean;
}
