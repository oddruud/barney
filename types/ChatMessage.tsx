import { Timestamp } from "firebase/firestore";

export enum MessageType {
  Text = 'text',
  Image = 'image',
  Audio = 'audio',
  Video = 'video',
  File = 'file',
  Location = 'location',
}

export interface ChatMessage {
  id: string;
  chatId: string;
  timestamp: Timestamp;
  userId: string;
  userName: string;
  message: string;
  newMessage: boolean;
  type: MessageType;
  imageUrl: string;
  replyToId?: string;
  replyToChatMessage?: ChatMessage;
  emoticons?: string[];
  location?: {
    latitude: number;
    longitude: number;
  };
}
