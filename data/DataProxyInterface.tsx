import { PlannedWalk } from '../types/PlannedWalk';
import { UserDetails } from '../types/UserDetails';
import { ChatMessage } from '../types/ChatMessage';

// Define the DataProxy interface
interface DataProxy {
    getPlannedWalks(): Promise<PlannedWalk[]>;
    getPlannedWalksByUserId(userId: number): Promise<PlannedWalk[]>;
    getPlannedWalk(walkId: string): Promise<PlannedWalk | null>;
    addPlannedWalk(walk: PlannedWalk): Promise<void>;
    updatePlannedWalk(id: string, updatedWalk: Partial<PlannedWalk>): Promise<void>;
    cancelPlannedWalk(id: string): Promise<void>;
    getLatestWalk(): Promise<PlannedWalk | null>;
    getUserDetailsById(id: number): Promise<UserDetails | null>;
    getRandomWalkingQuote(): Promise<string>;
    getNextWalk(): Promise<PlannedWalk | null>;
    getUsersFromJoinedUserIds(walkId: string): Promise<UserDetails[]>;
    getChatMessagesForWalk(walkId: string): Promise<ChatMessage[]>;
    addChatMessage(message: ChatMessage): Promise<void>;
    updateUserProfile(id: number, name: string, bio: string, profileImage: string): Promise<UserDetails | null>;
    createWalk(userId: number, date: Date, duration: number, maxParticipants: number, description: string, locationName: string, location: { latitude: number, longitude: number }): Promise<PlannedWalk | null>;
    unsubscribeFromWalk(walkId: string, userId: number): Promise<PlannedWalk | null>;
    joinWalk(walkId: string, userId: number): Promise<PlannedWalk | null>;
    getLocalUserData(): Promise<UserDetails | null>;
    checkSessionValidity(userId: number): Promise<boolean>;
}

export { DataProxy };