import { Timestamp } from "firebase/firestore";

export interface ChatMessage {
  id: string;
  chatId: string;
  timestamp: Timestamp;
  userId: string;
  userName: string;
  message: string;
  newMessage: boolean;
}
