import { PlannedWalk } from '../types/PlannedWalk';
import { UserDetails } from '../types/UserDetails';
import { ChatMessage } from '../types/ChatMessage';

// Define the DataProxy interface
interface DataProxy {
    initialize(): Promise<void>;
    getPlannedWalks(): Promise<PlannedWalk[]>;
    getJoinedWalksByUserId(userId: string): Promise<PlannedWalk[]>;
    getInvitedPlannedWalksByUserId(userId: string): Promise<PlannedWalk[]>;
    declineInvite(walkId: string, userId: string): Promise<PlannedWalk | null>;
    getPlannedWalk(walkId: string): Promise<PlannedWalk | null>;
    createPlannedWalk(walk: PlannedWalk): Promise<string>;
    updatePlannedWalk(id: string, updatedWalk: Partial<PlannedWalk>): Promise<void>;
    cancelPlannedWalk(id: string): Promise<void>;
    getLatestWalk(): Promise<PlannedWalk | null>;
    getUserDetailsById(id: string): Promise<UserDetails | null>;
    getRandomWalkingQuote(): Promise<string>;
    getNextWalkForUser(userId: string): Promise<PlannedWalk | null>;
    getUsersFromJoinedUserIds(walkId: string): Promise<UserDetails[]>;
    getChatMessagesForWalk(walkId: string): Promise<ChatMessage[]>;
    addChatMessage(message: ChatMessage): Promise<void>;
    updateUserProfile(userDetails: UserDetails): Promise<void>;
    joinWalk(walkId: string, userId: string): Promise<PlannedWalk | null>;
    registerUser(uid: string, email: string): Promise<UserDetails | null>;
    getAllUsers(): Promise<UserDetails[]>;
    checkSessionValidity(userId: string): Promise<boolean>;
    getEnticingImage(): Promise<string>;
}

export { DataProxy };