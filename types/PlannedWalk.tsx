import { RewardInfo } from "./RewardInfo";
import { UserDetails } from "./UserDetails";

//database return
export interface PlannedWalk {
    id: string;
    dateTime: string;
    location: string;
    description: string;
    duration: number;
    userId: string;
    username: string;
    fullName: string;
    latitude: number;
    longitude: number;
    profileImage: string;
    lastMessageDate:string;
    lastDateMessagesChecked: string;
    maxParticipants: number;
    joinedUserIds: string[];
    invitedUserIds: string[];
    cancelled: boolean;
  }