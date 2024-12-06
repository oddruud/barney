export interface ChatMessage {
  id: string;
  walkId: string;
  timestamp: string;
  userId: string;
  userName: string;
  message: string;
  newMessage: boolean;
}
