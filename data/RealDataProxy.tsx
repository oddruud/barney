import { PlannedWalk } from '../types/PlannedWalk';
import { UserDetails } from '../types/UserDetails';
import { ChatMessage } from '../types/ChatMessage';
import { DataProxy } from './DataProxyInterface'; // Adjust the path as necessary

class RealDataProxy implements DataProxy {
  async getPlannedWalks(): Promise<PlannedWalk[]> {
    const response = await fetch('/api/plannedWalks');
    return response.json();
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

  async deletePlannedWalk(id: string): Promise<void> {
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

  async updateUserProfile(name: string, description: string, profileImage: string): Promise<void> {
    // TODO: Implement updateUserProfile
  }

  async createWalk(userId: number, date: Date, duration: number, maxParticipants: number, description: string, locationName: string, location: { latitude: number, longitude: number }): Promise<PlannedWalk | null> {
    // TODO: Implement createWalk
    return null;
  }

  async unsubscribeFromWalk(walkId: string): Promise<void> {
    // TODO: Implement unsubscribeFromWalk
  }
}

export { RealDataProxy };
