import { PlannedWalk } from '../types/PlannedWalk';
import { UserDetails } from '../types/UserDetails';
import { ChatMessage } from '../types/ChatMessage';
import { plannedWalks as dummyPlannedWalks, userDetails as dummyUserDetails, walkingQuotes, chatMessages, enticingImages } from './DummyData';
import { DataProxy } from './DataProxyInterface';

// Implement the DummyDataProxy class
class DummyDataProxy implements DataProxy {

  async initialize(): Promise<void> {
    return new Promise((resolve) => {
      //set the date of each walk to a random date in the future between 0 and 7 days from today
      const today = new Date();
      dummyPlannedWalks.forEach((walk) => {
        const futureDate = new Date(today);
        const index = Math.floor(Math.random() * 7);
        futureDate.setDate(today.getDate() + index); // Set each walk's date to today + index days
        walk.dateTime = futureDate.toISOString();
      });
      resolve();
    });
  }

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

  async getJoinedWalksByUserId(userId: string): Promise<PlannedWalk[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(dummyPlannedWalks.filter(walk => walk.joinedUserIds.includes(userId) && !walk.cancelled));
      }, 10);
    });
  }

  async getInvitedPlannedWalksByUserId(userId: string): Promise<PlannedWalk[]> {
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

  async declineInvite(walkId: string, userId: string): Promise<PlannedWalk | null> {
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

  async getUserDetailsById(id: string): Promise<UserDetails | null> {
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

  async getNextWalkForUser(userId: string): Promise<PlannedWalk | null> {
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

  async updateUserProfile(userDetails: UserDetails): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        //get dummy user details
        const user = dummyUserDetails.find(user => user.id === userDetails.id);
        if (!user) {
          console.warn("user not found", userDetails.id);
          resolve();
          return;
        }
        //update user details
        user.fullName = userDetails.fullName;
        user.bio = userDetails.bio;
        user.profileImage = userDetails.profileImage;
        resolve();
      }, 500); // Simulate async delay
    });
  }

  async createPlannedWalk(walk: PlannedWalk): Promise<string> {
    const id = Date.now().toString();
    walk.id = id;

    return new Promise((resolve) => {
      setTimeout(() => {
        dummyPlannedWalks.push(walk);
        resolve(id);
      }, 500);
    });
  }

  async unsubscribeFromWalk(walkId: string, userId: string): Promise<PlannedWalk | null> {
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

  async joinWalk(walkId: string, userId: string): Promise<PlannedWalk | null> {
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

  async checkSessionValidity(userId: string): Promise<boolean> {
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