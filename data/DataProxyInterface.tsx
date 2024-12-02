import { PlannedWalk } from '../types/PlannedWalk';
import { UserDetails } from '../types/UserDetails';
import { ChatMessage } from '../types/ChatMessage';
// Define the DataProxy interface
interface DataProxy {
    getPlannedWalks(): Promise<PlannedWalk[]>;
    addPlannedWalk(walk: PlannedWalk): Promise<void>;
    updatePlannedWalk(id: string, updatedWalk: Partial<PlannedWalk>): Promise<void>;
    deletePlannedWalk(id: string): Promise<void>;
    getLatestWalk(): Promise<PlannedWalk | null>;
    getUserDetailsById(id: number): Promise<UserDetails | null>;
    getRandomWalkingQuote(): Promise<string>;
    getNextWalk(): Promise<PlannedWalk | null>;
    getUsersFromJoinedUserIds(walkId: string): Promise<UserDetails[]>;
    getChatMessagesForWalk(walkId: string): Promise<ChatMessage[]>;
    addChatMessage(message: ChatMessage): Promise<void>;
    updateUserProfile(name: string, description: string, profileImage: string): Promise<void>;
    createWalk(userId: number, date: Date, duration: number, maxParticipants: number, description: string, locationName: string, location: { latitude: number, longitude: number }): Promise<PlannedWalk | null>;
    unsubscribeFromWalk(walkId: string): Promise<void>;
}

export { DataProxy };