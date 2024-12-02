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
}

export { DataProxy };