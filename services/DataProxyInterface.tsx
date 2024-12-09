import { PlannedWalk } from '../types/PlannedWalk';
import { UserDetails } from '../types/UserDetails';
import { ChatMessage } from '../types/ChatMessage';
import { Quote } from '../types/Quote';
import { WalkWithDistance } from '@/types/WalkWithDistance';
import { LocationObject } from 'expo-location';
import { UserDetailsWithDistance } from '@/types/UserDetailsWithDistance';

// Define the DataProxy interface
interface DataProxy {
    // Initialize the data proxy
    initialize(): Promise<void>;
    // Get all planned walks
    getPlannedWalks(): Promise<PlannedWalk[]>;
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
    // Register a user
    registerUser(uid: string, email: string): Promise<UserDetails | null>;
    // Get all users
    getAllUsers(): Promise<UserDetails[]>;
    // Upload an image
    uploadImage(imageURI: string, onProgress?:((progress:number)=>void)): Promise<string>;
    // Add a rating for a user
    addRatingForUser(userId: string, rating: number): Promise<UserDetails | null>;

    // Get walks sorted by distance
    getWalksSortedByDistance(user: UserDetails, userLocation: LocationObject | null, startDate: Date, endDate: Date, maxDistance: number): Promise<WalkWithDistance[]>;

    getUsersSortedByDistance(user: UserDetails, maxDistance: number): Promise<UserDetailsWithDistance[]>;
}

export { DataProxy };
