import { PlannedWalk } from '../types/PlannedWalk';
import { UserDetails } from '../types/UserDetails';
import { ChatMessage } from '../types/ChatMessage';
import { Quote } from '../types/Quote';
import { WalkWithDistance } from '@/types/WalkWithDistance';
import { LocationObject } from 'expo-location';
import { UserDetailsWithDistance } from '@/types/UserDetailsWithDistance';
import { UserInteraction } from '@/types/UserInteraction';
import { RewardInfo } from '@/types/RewardInfo';
import { Timestamp } from 'firebase/firestore';

// Define the DataProxy interface
interface DataProxy {
    // Initialize the data proxy
    initialize(): Promise<void>;
    // Get all planned walks
    getPlannedWalks(from?: Timestamp, to?: Timestamp): Promise<PlannedWalk[]>;
    // Get all walks joined by a user
    getJoinedWalksByUserId(userId: string): Promise<PlannedWalk[]>;
    // Get all invited walks by a user
    getInvitedPlannedWalksByUserId(userId: string): Promise<PlannedWalk[]>;
    // Decline an invite
    declineInvite(walkId: string, userId: string): Promise<PlannedWalk | null>;
    // Get a planned walk by id
    getPlannedWalk(walkId: string): Promise<PlannedWalk | null>;
    // Create a planned walk
    createPlannedWalk(walk: PlannedWalk): Promise<string>;
    // Update a planned walk
    updatePlannedWalk(id: string, updatedWalk: PlannedWalk): Promise<void>;
    // Cancel a planned walk
    cancelPlannedWalk(id: string): Promise<void>;
    // Get the latest walk
    getLatestWalk(): Promise<PlannedWalk | null>;
    // Get user details by id
    getUserDetailsById(id: string): Promise<UserDetails | null>;
    // Get a random walking quote
    getRandomWalkingQuote(): Promise<Quote>;
    // Get the next walk for a user
    getNextWalkForUser(userId: string): Promise<PlannedWalk | null>;
    // Get users from joined user ids
    getUsersFromJoinedUserIds(walkId: string): Promise<UserDetails[]>;
    // Get chat messages for a walk
    getChatMessages(chatId: string): Promise<ChatMessage[]>;
    // Add a chat message
    addChatMessage(message: ChatMessage): Promise<void>;
    // Update a user profile
    updateUser(userDetails: UserDetails): Promise<void>;
    // Join a walk
    joinWalk(walkId: string, userId: string): Promise<PlannedWalk | null>;

    // Unsubscribe from a walk
    unsubscribeFromWalk(walkId: string, userId: string): Promise<PlannedWalk | null> 
    // Register a user
    registerUser(uid: string, email: string): Promise<UserDetails | null>;
    // Delete a user
    deleteUser(userId: string): Promise<void>;
    // Get all users
    getAllUsers(): Promise<UserDetails[]>;
    // Upload an image
    uploadImage(imageURI: string, onProgress?:((progress:number)=>void)): Promise<string>;
    // Add a rating for a user
    addRatingForUser(userId: string, rating: number): Promise<UserDetails | null>;

    // Get walks sorted by distance
    getWalksSortedByDistance(user: UserDetails, userLocation: LocationObject | null, startDate: Date, endDate: Date, maxDistance: number): Promise<WalkWithDistance[]>;

    getUsersSortedByDistance(user: UserDetails, maxDistance: number): Promise<UserDetailsWithDistance[]>;
   
    // Get user interaction for users
    getUserInteractionForUsers(userId1: string, userId2: string): Promise<UserInteraction | null>;

    // Create user interaction for users
    createUserInteractionForUsers(userId1: string, userId2: string): Promise<UserInteraction | null>;

    // Get last chat mesage for chat id
    getLastChatMessageForChatId(chatId: string): Promise<ChatMessage | null>;

    //save reward info
    saveRewardInfo(rewardInfo: RewardInfo): Promise<void>;

    //get reward info
    getRewardInfo(walkId: string): Promise<RewardInfo | null>;

    //get random front page video
    getRandomFrontPageVideo(): Promise<string>;
}

export { DataProxy };
