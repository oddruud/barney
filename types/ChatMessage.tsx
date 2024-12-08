export interface ChatMessage {
  id: string;
  chatId: string;
  timestamp: string;
  userId: string;
  userName: string;
  message: string;
  newMessage: boolean;
}
