import { PlannedWalk } from '../types/PlannedWalk';
import { UserDetails } from '../types/UserDetails';
import { ChatMessage } from '../types/ChatMessage';
import { DataProxy } from './DataProxyInterface'; // Adjust the path as necessary

class RealDataProxy implements DataProxy {

  async initialize(): Promise<void> {
    return new Promise((resolve) => {
      resolve();
    });
  }

  async getPlannedWalks(): Promise<PlannedWalk[]> {
    const response = await fetch('/api/plannedWalks');
    return response.json();
  }

  async getPlannedWalk(walkId: string): Promise<PlannedWalk | null> {
    const response = await fetch(`/api/plannedWalks/${walkId}`);
    return response.json();
  }

  async getPlannedWalksByUserId(userId: number): Promise<PlannedWalk[]> {
    const response = await fetch(`/api/plannedWalksByUserId/${userId}`);
    return response.json();
  }

  async getInvitedPlannedWalksByUserId(userId: number): Promise<PlannedWalk[]> {
    const response = await fetch(`/api/invitedPlannedWalksByUserId/${userId}`);
    return response.json();
  }

  async declineInvite(walkId: string, userId: number): Promise<PlannedWalk | null> {
    // TODO: Implement declineInvite
    return null;
  }

  async addPlannedWalk(walk: PlannedWalk): Promise<void> {
    await fetch('/api/plannedWalks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(walk),
    });
  }

  async updatePlannedWalk(id: string, updatedWalk: Partial<PlannedWalk>): Promise<void> {
    await fetch(`/api/plannedWalks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedWalk),
    });
  }

  async cancelPlannedWalk(id: string): Promise<void> {
    await fetch(`/api/plannedWalks/${id}`, {
      method: 'DELETE',
    });
  }

  async getLatestWalk(): Promise<PlannedWalk | null> {
    const walks = await this.getPlannedWalks();
    if (walks.length === 0) return null;
    walks.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
    return walks[0];
  }

  async getUserDetailsById(id: number): Promise<UserDetails | null> {
    const response = await fetch(`/api/userDetails/${id}`);
    if (!response.ok) {
      return null;
    }
    return response.json();
  }

  async getRandomWalkingQuote(): Promise<string> {
    const response = await fetch('/api/randomWalkingQuote');
    if (!response.ok) {
      throw new Error('Failed to fetch random walking quote');
    }
    return response.text();
  }

  async getNextWalk(): Promise<PlannedWalk | null> {
    const walks = await this.getPlannedWalks();
    const now = new Date();
    const futureWalks = walks.filter(walk => new Date(walk.dateTime) > now);
    if (futureWalks.length === 0) return null;
    futureWalks.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
    return futureWalks[0];
  }

  async getUsersFromJoinedUserIds(walkId: string): Promise<UserDetails[]> {
    const response = await fetch(`/api/usersFromJoinedUserIds/${walkId}`);
    return response.json();
  }

  async getChatMessagesForWalk(walkId: string): Promise<ChatMessage[]> {
    const response = await fetch(`/api/chatMessages/${walkId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch chat messages');
    }
    return response.json();
  }

  async addChatMessage(message: ChatMessage): Promise<void> {
    await fetch('/api/chatMessages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });
  }

  async updateUserProfile(id:number, name: string, bio: string, profileImage: string): Promise<UserDetails | null> {
    // TODO: Implement updateUserProfile
    return null;
  }

  async createWalk(userId: number, date: Date, duration: number, maxParticipants: number, description: string, locationName: string, location: { latitude: number, longitude: number }, invitedUserIds: number[]): Promise<PlannedWalk | null> {
    // TODO: Implement createWalk
    return null;
  }

  async unsubscribeFromWalk(walkId: string, userId: number): Promise<PlannedWalk | null> {
    // TODO: Implement unsubscribeFromWalk
    return null;
  }

  async joinWalk(walkId: string, userId: number): Promise<PlannedWalk | null> {
    // TODO: Implement joinWalk
    return null;
  }

  async registerUser(uid: string, email: string): Promise<UserDetails | null> {
    // TODO: Implement registerUser
    return null;
  }

  async getLocalUserData(uid: string): Promise<UserDetails | null> {
    // TODO: Implement getUserData
    return null;
  }

  async getAllUsers(): Promise<UserDetails[]> {
    // TODO: Implement getAllUsers
    return [];
  }

  async checkSessionValidity(userId: number): Promise<boolean> {
    // TODO: Implement checkSessionValidity
    return false;
  }

  async getNextWalkForUser(userId: number): Promise<PlannedWalk | null> {
    // TODO: Implement getNextWalkForUser
    return null;
  }

  async getEnticingImage(): Promise<string> {
    // TODO: Implement getEnticingImage
    return '';
  }
}

export { RealDataProxy };
