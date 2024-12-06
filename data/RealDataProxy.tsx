import { PlannedWalk } from '../types/PlannedWalk';
import { UserDetails } from '../types/UserDetails';
import { ChatMessage } from '../types/ChatMessage';
import { DataProxy } from './DataProxyInterface';
import {getDocs,collection, doc, getDoc, getFirestore, setDoc, query, where} from "firebase/firestore";

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



  async getJoinedWalksByUserId(userId: string): Promise<PlannedWalk[]> {
    console.log("Getting joined walks by user id", userId);
    const db = getFirestore();
    const collectionRef = collection(db, "walks");
    const q = query(collectionRef, where("joinedUserIds", "array-contains", userId));

    console.log("Query", q);

    const querySnapshot = await getDocs(q);

    console.log("Query snapshot", querySnapshot);

    return querySnapshot.docs.map((doc) => doc.data() as PlannedWalk);
  }

  async getInvitedPlannedWalksByUserId(userId: string): Promise<PlannedWalk[]> {
    const response = await fetch(`/api/invitedPlannedWalksByUserId/${userId}`);
    return response.json();
  }

  async declineInvite(walkId: string, userId: string): Promise<PlannedWalk | null> {
    // TODO: Implement declineInvite
    return null;
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

  async getUserDetailsById(id: string): Promise<UserDetails | null> {
    const db = getFirestore();
    const docRef = doc(db, "users", id);
    
    let userData = await getDoc(docRef).then((docSnap) => {
      console.log("user details data", docSnap.data());
      const userDetails = docSnap.data() as UserDetails | null;
      console.log("user details", userDetails);
      return userDetails;
    }).catch((error) => {
      console.error("Error getting user details", error);
      throw error;
    });

    return userData as UserDetails | null;
  }

  async getPlannedWalk(walkId: string): Promise<PlannedWalk | null> {
    console.log("Getting planned walk", walkId);

    const db = getFirestore();
    const docRef = doc(db, "walks", walkId);
    
    let walkData = await getDoc(docRef).then((docSnap) => {
      console.log("walk data", docSnap.data());
      const plannedWalk = docSnap.data() as PlannedWalk | null;
      return plannedWalk;
    }).catch((error) => {
      console.error("Error getting user details", error);
      throw error;
    });

    return walkData as PlannedWalk | null;
  }

  async registerUser(uid: string, email: string): Promise<UserDetails | null> {
    const db = getFirestore();
    await setDoc(doc(db, "users", uid), {
      id: uid,
      email: email,
      userName: email.split("@")[0],
      activeSince: new Date().toISOString(),
      fullName: "",
      bio: "",
      rating: 0,
      numberOfRatings: 0,
      profileImage: "",
      walksCompleted: 0
    }).then(async () => {
      return await this.getUserDetailsById(uid);
    }).catch((error) => {
      console.error("Error registering user", error);
      throw error;
    });

    return null;
  }

  async createPlannedWalk(walk: PlannedWalk): Promise<string> {
    console.log("Creating planned walk", walk);
    const db = getFirestore();
    walk.id = Date.now().toString();
    await setDoc(doc(db, "walks", walk.id), walk).then(() => {
      console.log("walk created", walk.id);
      return walk.id;
    }).catch((error) => {
      console.error("Error creating walk", error);
      throw error;
    });
 
    return walk.id;
  }

  async updateUserProfile(userDetails: UserDetails): Promise<void> {
    const db = getFirestore();
    await setDoc(doc(db, "users", userDetails.id), {
      id: userDetails.id,
      email: userDetails.email,
      userName: userDetails.userName,
      activeSince: userDetails.activeSince,
      fullName: userDetails.fullName,
      bio: userDetails.bio,
      profileImage: userDetails.profileImage,
      walksCompleted: userDetails.walksCompleted,
      rating: userDetails.rating,
      numberOfRatings: userDetails.numberOfRatings
    }).then(async () => {
      console.log("User profile updated");
    }).catch((error) => {
      console.error("Error updating user profile", error);
      throw error;
    });
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

  async unsubscribeFromWalk(walkId: string, userId: string): Promise<PlannedWalk | null> {
    // TODO: Implement unsubscribeFromWalk
    return null;
  }

  async joinWalk(walkId: string, userId: string): Promise<PlannedWalk | null> {
    // TODO: Implement joinWalk
    return null;
  }

  async getAllUsers(): Promise<UserDetails[]> {
    // TODO: Implement getAllUsers
    return [];
  }

  async checkSessionValidity(userId: string): Promise<boolean> {
    // TODO: Implement checkSessionValidity
    return false;
  }

  async getNextWalkForUser(userId: string): Promise<PlannedWalk | null> {
    // TODO: Implement getNextWalkForUser
    return null;
  }

  async getEnticingImage(): Promise<string> {
    // TODO: Implement getEnticingImage
    return '';
  }
}

export { RealDataProxy };
