import { PlannedWalk } from '../types/PlannedWalk';
import { UserDetails } from '../types/UserDetails';
import { ChatMessage } from '../types/ChatMessage';
import { plannedWalks as dummyPlannedWalks, userDetails as dummyUserDetails, walkingQuotes, chatMessages } from './DummyData';
import { DataProxy } from './DataProxyInterface'; // Adjust the path as necessary

// Implement the DummyDataProxy class
class DummyDataProxy implements DataProxy {
  async getPlannedWalks(): Promise<PlannedWalk[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(dummyPlannedWalks);
      }, 10);
    });
  }

  async addPlannedWalk(walk: PlannedWalk): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        dummyPlannedWalks.push(walk);
        resolve();
      }, 500);
    });
  }

  async updatePlannedWalk(id: string, updatedWalk: Partial<PlannedWalk>): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        dummyPlannedWalks = dummyPlannedWalks.map(walk => 
          walk.id === id ? { ...walk, ...updatedWalk } : walk
        );
        resolve();
      }, 500);
    });
  }

  async deletePlannedWalk(id: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        dummyPlannedWalks = dummyPlannedWalks.filter(walk => walk.id !== id);
        resolve();
      }, 500);
    });
  }

  async getLatestWalk(): Promise<PlannedWalk | null> {
    const walks = await this.getPlannedWalks();
    if (walks.length === 0) return null;
    walks.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return walks[0];
  }

  async getUserDetailsById(id: number): Promise<UserDetails | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = dummyUserDetails.find(user => user.id === id);
        resolve(user || null);
      }, 500);
    });
  }

  async getUsersFromJoinedUserIds(walkId: string): Promise<UserDetails[]> {
    return new Promise((resolve) => {
      const walk = dummyPlannedWalks.find(walk => walk.id === walkId);
      if (!walk) {
        resolve([]);
        return;
      }

      const users = walk.joinedUserIds.map(userId => {
        return dummyUserDetails.find(user => user.id === userId);
      }).filter(user => user !== undefined) as UserDetails[];

      resolve(users);
    });
  }

  // Updated method to return a promise
  getRandomWalkingQuote(): Promise<string> {
    return new Promise((resolve) => {
      resolve(walkingQuotes[Math.floor(Math.random() * walkingQuotes.length)]);
    });
  }

  async getNextWalk(): Promise<PlannedWalk | null> {
    const walks = await this.getPlannedWalks();
    const currentDate = new Date();
    const futureWalks = walks.filter(walk => new Date(walk.dateTime) > currentDate);
    if (futureWalks.length === 0) return null;
    futureWalks.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
    return futureWalks[0];
  }

  async getChatMessagesForWalk(walkId: string): Promise<ChatMessage[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const messages = chatMessages.filter(message => message.walkId === walkId);
        resolve(messages);
      }, 10);
    });
  }

  async addChatMessage(message: ChatMessage): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        chatMessages.push(message);
        resolve();
      }, 10);
    });
  }

  async updateUserProfile(name: string, description: string, profileImage: string): Promise<void> {
    // TODO: Implement updateUserProfile
  }
}

export { DummyDataProxy };