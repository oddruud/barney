import { PlannedWalk } from '../types/PlannedWalk';
import { UserDetails } from '../types/UserDetails';
import { ChatMessage } from '../types/ChatMessage';
import { plannedWalks as dummyPlannedWalks, userDetails as dummyUserDetails, walkingQuotes, chatMessages, enticingImages } from './DummyData';
import { DataProxy } from './DataProxyInterface';

// Implement the DummyDataProxy class
class DummyDataProxy implements DataProxy {
  async getPlannedWalks(): Promise<PlannedWalk[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(dummyPlannedWalks);
      }, 10);
    });
  }

  async getPlannedWalk(walkId: string): Promise<PlannedWalk | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(dummyPlannedWalks.find(walk => walk.id === walkId) || null);
      }, 10);
    });
  }

  async getPlannedWalksByUserId(userId: number): Promise<PlannedWalk[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(dummyPlannedWalks.filter(walk => walk.joinedUserIds.includes(userId) && !walk.cancelled));
      }, 10);
    });
  }

  async getInvitedPlannedWalksByUserId(userId: number): Promise<PlannedWalk[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const currentDate = new Date();
        resolve(dummyPlannedWalks.filter(walk => 
          walk.invitedUserIds.includes(userId) && 
          !walk.joinedUserIds.includes(userId) &&
          new Date(walk.dateTime) > currentDate
        ));
      }, 10);
    });
  }

  async declineInvite(walkId: string, userId: number): Promise<PlannedWalk | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const walk = dummyPlannedWalks.find(walk => walk.id === walkId);
        if (!walk) {
          resolve(null);
          return;
        }

        walk.invitedUserIds = walk.invitedUserIds.filter(id => id !== userId);

        resolve(walk);
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

  async cancelPlannedWalk(id: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const walk = dummyPlannedWalks.find(walk => walk.id === id);
        if (walk) {
          walk.cancelled = true;
        }
        resolve();
      }, 500);
    });
  }

  async getLatestWalk(): Promise<PlannedWalk | null> {
    const walks = await this.getPlannedWalks();
    if (walks.length === 0) return null;
    walks.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
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

  async getNextWalkForUser(userId: number): Promise<PlannedWalk | null> {
    const walks = await this.getPlannedWalks();
    const currentDate = new Date();
    const futureWalks = walks.filter(walk => 
        new Date(walk.dateTime) > currentDate && 
        walk.joinedUserIds.includes(userId) &&
        !walk.cancelled
    );
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

  async updateUserProfile(id: number, name: string, bio: string, profileImage: string): Promise<UserDetails | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        //get dummy user details
        const user = dummyUserDetails.find(user => user.id === id);
        if (!user) {
          resolve(null);
          return;
        }
        //update user details
        user.fullName = name;
        user.bio = bio;
        user.profileImage = profileImage;
        resolve(user);
      }, 500); // Simulate async delay
    });
  }

  async createWalk(userId: number, date: Date, duration: number, maxParticipants: number, description: string, locationName: string, location: { latitude: number, longitude: number }, invitedUserIds: number[]): Promise<PlannedWalk | null> {
    const newWalk: PlannedWalk = {
      id: Date.now().toString(),
      userId: userId,
      dateTime: date.toISOString(),
      duration: duration,
      description: description,
      location: locationName,
      longitude: location.longitude,
      latitude: location.latitude,
      username: dummyUserDetails.find(user => user.id === userId)?.userName || '',
      fullName: dummyUserDetails.find(user => user.id === userId)?.fullName || '',
      profileImage: dummyUserDetails.find(user => user.id === userId)?.profileImage || '',
      lastMessageDate: '',
      lastDateMessagesChecked: '',
      maxParticipants: maxParticipants,
      joinedUserIds: [userId],
      invitedUserIds: invitedUserIds,
      cancelled: false,
    };

    dummyPlannedWalks.push(newWalk);

    return newWalk;
  }

  async unsubscribeFromWalk(walkId: string, userId: number): Promise<PlannedWalk | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const walk = dummyPlannedWalks.find(walk => walk.id === walkId);
        if (!walk) {
          resolve(null);
          return;
        }

        // Remove the userId from joinedUserIds if it exists
        walk.joinedUserIds = walk.joinedUserIds.filter(id => id !== userId);

        resolve(walk);
      }, 10); // Simulate async delay
    });
  }

  async joinWalk(walkId: string, userId: number): Promise<PlannedWalk | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const walk = dummyPlannedWalks.find(walk => walk.id === walkId);
        if (!walk) {
          resolve(null);
          return;
        }
        
        // Check if the user is already joined
        if (!walk.joinedUserIds.includes(userId)) {
          walk.joinedUserIds.push(userId);
        }
        
        resolve(walk);
      }, 10); // Simulate async delay
    });
  }
  async registerUser(uid: string, email: string): Promise<UserDetails | null> {
    return new Promise((resolve) => {
      console.log("register user", uid, email);
      resolve(null);
    });
  }
  //get a random user from the dummyUserDetails array
  async getLocalUserData(uid: string): Promise<UserDetails | null> {
    return new Promise((resolve) => {
      const randomIndex = Math.floor(Math.random() * dummyUserDetails.length);
      resolve(dummyUserDetails[randomIndex]);
    });
  }

  async getAllUsers(): Promise<UserDetails[]> {
    return dummyUserDetails;
  }

  async checkSessionValidity(userId: number): Promise<boolean> {
    return new Promise((resolve) => {
      resolve(true);
    });
  }

  async getEnticingImage(): Promise<string> {
    return new Promise((resolve) => {
      const randomIndex = Math.floor(Math.random() * enticingImages.length);
      resolve(enticingImages[randomIndex]);
    });
  }
}

export { DummyDataProxy };