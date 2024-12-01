export interface PlannedWalk {
    id: string;
    date: string;
    time: string;
    location: string;
    description: string;
    duration: number;
    userId: number;
    username: string;
    fullName: string;
    latitude: number;
    longitude: number;
    profileImage: string;
    hasNewMessages: boolean;
    joinedParticipants: number;
    maxParticipants: number;
  }
