import { PlannedWalk } from '../types/PlannedWalk';
import { UserDetails } from '../types/UserDetails';
import { ChatMessage } from '../types/ChatMessage';
import { DataProxy } from './DataProxyInterface';
import {getDocs,collection, doc, getDoc, getFirestore, setDoc, query, where} from "firebase/firestore";
import { getRandomId } from '../utils/IDUtils';
import { Quote } from '@/types/Quote';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, UploadMetadata } from "firebase/storage";
import { WalkWithDistance } from '@/types/WalkWithDistance';
import { calculateDistance, haversineDistance } from '@/utils/geoUtils';
import { LocationObject } from 'expo-location';
import { UserDetailsWithDistance } from '@/types/UserDetailsWithDistance';

class FireStoreDataProxy implements DataProxy {

  async initialize(): Promise<void> {
    return new Promise((resolve) => {
      resolve();
    });
  }

  //get all planned walks that are not cancelled. todo create function where dateTime is in the future
  async getPlannedWalks(): Promise<PlannedWalk[]> {
    const db = getFirestore();
    const collectionRef = collection(db, "walks");
    const q = query(
      collectionRef, 
      where("cancelled", "==", false)
    );
    const querySnapshot = await getDocs(q);

//for each walk, get the userDetails and add it to the walk
    const walksWithUserDetails = await Promise.all(querySnapshot.docs.map(async (doc) => {
      const walk = doc.data() as PlannedWalk;
      const userDetails = await this.getUserDetailsById(walk.userId);
      walk.fullName = userDetails?.fullName ?? '';
      walk.username = userDetails?.userName ?? '';
      walk.profileImage = userDetails?.profileImage ?? '';
      return walk;
    }));
    
    return walksWithUserDetails;
  }

  async getJoinedWalksByUserId(userId: string): Promise<PlannedWalk[]> {
    const db = getFirestore();
    const collectionRef = collection(db, "walks");
    const q = query(
      collectionRef, 
      where("joinedUserIds", "array-contains", userId),
      where("cancelled", "==", false)
    );

    const querySnapshot = await getDocs(q);

    const walksWithUserDetails = await Promise.all(querySnapshot.docs.map(async (doc) => {
      const walk = doc.data() as PlannedWalk;
      const userDetails = await this.getUserDetailsById(walk.userId);
      walk.fullName = userDetails?.fullName ?? '';
      walk.username = userDetails?.userName ?? '';
      walk.profileImage = userDetails?.profileImage ?? '';
      return walk;
    }));

    
    const sorted = walksWithUserDetails.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
    return sorted;
  }

  async getInvitedPlannedWalksByUserId(userId: string): Promise<PlannedWalk[]> {
    const db = getFirestore();
    const collectionRef = collection(db, "walks");
    const q = query(
      collectionRef, 
      where("invitedUserIds", "array-contains", userId),
      where("cancelled", "==", false)
    );

    const querySnapshot = await getDocs(q);
    const walksWithUserDetails = await Promise.all(querySnapshot.docs.map(async (doc) => {
      const walk = doc.data() as PlannedWalk;
      const userDetails = await this.getUserDetailsById(walk.userId);
      walk.fullName = userDetails?.fullName ?? '';
      walk.username = userDetails?.userName ?? '';
      walk.profileImage = userDetails?.profileImage ?? '';
      return walk;
    }));
    //remove walks that have a date in the past
    const walksWithUserDetailsFromNow = walksWithUserDetails.filter(walk => new Date(walk.dateTime) > new Date());

    const sorted = walksWithUserDetailsFromNow.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
    return sorted
  }

  async declineInvite(walkId: string, userId: string): Promise<PlannedWalk | null> {
    const db = getFirestore();

    const walk = await this.getPlannedWalk(walkId);

    if (walk) {
      walk.invitedUserIds = walk.invitedUserIds.filter(id => id !== userId);
      await this.updatePlannedWalk(walkId, walk);
    }

    return walk;
  }

  async updatePlannedWalk(id: string, updatedWalk: PlannedWalk): Promise<void> {
    const db = getFirestore();
    const docRef = doc(db, "walks", id);
    await setDoc(docRef, updatedWalk).then(()=>{
    });
  }

  async cancelPlannedWalk(id: string): Promise<void> {
    const db = getFirestore();
    const walk = await this.getPlannedWalk(id);
    if (walk) {
      walk.cancelled = true;
      await this.updatePlannedWalk(id, walk);
    }
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
      const userDetails = docSnap.data() as UserDetails | null;
      return userDetails;
    }).catch((error) => {
      console.error("Error getting user details", error);
      throw error;
    });

    return userData as UserDetails | null;
  }

  async getPlannedWalk(walkId: string): Promise<PlannedWalk | null> {
    const db = getFirestore();
    const docRef = doc(db, "walks", walkId);
    
    let walkData = await getDoc(docRef).then((docSnap) => {
      const plannedWalk = docSnap.data() as PlannedWalk | null;
      return plannedWalk;
    }).catch((error) => {
      console.error("Error getting user details", error);
      throw error;
    });

    if (walkData) {
      const userDetails = await this.getUserDetailsById(walkData.userId);
      walkData.fullName = userDetails?.fullName ?? '';
      walkData.username = userDetails?.userName ?? '';
      walkData.profileImage = userDetails?.profileImage ?? '';
    }


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
    const db = getFirestore();
    const walkId = getRandomId();
    const walkWithId = {...walk, id: walkId};
    await setDoc(doc(db, "walks", walkWithId.id), walkWithId).then(() => {  
      return walkWithId.id;
    }).catch((error) => {
      console.error("Error creating walk", error);
      throw error;
    });

    return walkId;
  }

  async updateUser(userDetails: UserDetails): Promise<void> {
    const db = getFirestore();
    await setDoc(doc(db, "users", userDetails.id), userDetails).then(async () => {
    }).catch((error) => {
      console.error("Error updating user profile", error);
      throw error;
    });
  }

  async getRandomWalkingQuote(): Promise<Quote> {
    const db = getFirestore();
    const collectionRef = collection(db, "quotes");
    const querySnapshot = await getDocs(collectionRef);
    const randomIndex = Math.floor(Math.random() * querySnapshot.docs.length);
    const randomQuote = querySnapshot.docs[randomIndex].data() as Quote;
    return randomQuote;
  }

  //TODO very naive implementation, todo: use only future walks
  async getNextWalk(): Promise<PlannedWalk | null> {
    const walks = await this.getPlannedWalks();
    const now = new Date();
    const futureWalks = walks.filter(walk => new Date(walk.dateTime) > now);
    if (futureWalks.length === 0) return null;
    futureWalks.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
    return futureWalks[0];
  }

  async getUsersFromJoinedUserIds(walkId: string): Promise<UserDetails[]> {
    const walk = await this.getPlannedWalk(walkId);
    if (!walk) return [];
    const userDetailsPromises = walk.joinedUserIds.map(id => this.getUserDetailsById(id));
    return Promise.all(userDetailsPromises).then(users => users.filter(user => user !== null) as UserDetails[]);
  }

  async getChatMessages(chatId: string): Promise<ChatMessage[]> {
    const db = getFirestore();
    const collectionRef = collection(db, "chatMessages");
    const q = query(
      collectionRef, 
      where("chatId", "==", chatId)
    );

    const querySnapshot = await getDocs(q);
    const messages =  querySnapshot.docs.map((doc) => doc.data() as ChatMessage);
    const sortedMessages = messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    return sortedMessages;
  }

  async addChatMessage(message: ChatMessage): Promise<void> {
    const db = getFirestore();
    const messageId = getRandomId();
    const messageWithId = {...message, id: messageId};
    await setDoc(doc(db, "chatMessages", messageWithId.id), messageWithId).then(() => {  
    }).catch((error) => {
      console.error("Error adding chat message", error);
      throw error;
    });
  }

  async unsubscribeFromWalk(walkId: string, userId: string): Promise<PlannedWalk | null> {
    const db = getFirestore();

    const walk = await this.getPlannedWalk(walkId);

    if (walk) {
      walk.joinedUserIds = walk.joinedUserIds.filter(id => id !== userId);
      await this.updatePlannedWalk(walkId, walk);
    }
    return walk;
  }

  async joinWalk(walkId: string, userId: string): Promise<PlannedWalk | null> {
    const db = getFirestore();
    const walk = await this.getPlannedWalk(walkId);

    if (walk) {
      if (!walk.joinedUserIds.includes(userId)) {
        walk.joinedUserIds.push(userId);
      }
      await this.updatePlannedWalk(walkId, walk);
    }
    return walk;
  }

  async getAllUsers(): Promise<UserDetails[]> {
    const db = getFirestore();
    const collectionRef = collection(db, "users");
    const q = query(
      collectionRef
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => doc.data() as UserDetails);
  }

  //TODO very naive implementation, todo: do dateTime check in query
  async getNextWalkForUser(userId: string): Promise<PlannedWalk | null> {
    const walks = await this.getJoinedWalksByUserId(userId);
    if (walks.length === 0) return null;
    
    const now = new Date();
    const futureWalks = walks.filter(walk => new Date(walk.dateTime) > now);
    if (futureWalks.length === 0) return null;

    futureWalks.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

    return futureWalks[0];
  }

  async uploadImage(imageURI: string, onProgress?:((progress:number)=>void)): Promise<string> {
    return await this.uploadToFirebase(imageURI, getRandomId(), onProgress ?? null).then((result) => {
      return result.downloadUrl;
    });
  }

async uploadToFirebase(uri:string, name:string, onProgress:((progress:number)=>void)|null): Promise<{downloadUrl:string, metadata:UploadMetadata}> {
  const fetchResponse = await fetch(uri);
  const theBlob = await fetchResponse.blob();
  const imageRef = ref(getStorage(), `images/${name}`);
  const uploadTask = uploadBytesResumable(imageRef, theBlob);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress && onProgress(progress);
      },
      (error) => {
        // Handle unsuccessful uploads
        console.log(error);
        reject(error);
      },
      async () => {
        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
        resolve({
          downloadUrl,
          metadata: uploadTask.snapshot.metadata,
        });
      }
    );
  });
}
  async addRatingForUser(userId: string, rating: number): Promise<UserDetails | null> {
    const db = getFirestore();
    const userRef = doc(db, "users", userId);
    let userData = await getDoc(userRef).then((docSnap) => {
      const user = docSnap.data() as UserDetails | null;
      return user;
    });

    if (userData) {
      userData.rating = (userData.rating * userData.numberOfRatings + rating) / (userData.numberOfRatings + 1);
      userData.numberOfRatings += 1;
      await this.updateUser(userData);
    }

    return userData;
  }

  async getWalksSortedByDistance(
    user: UserDetails,
    userLocation: LocationObject | null,
    startDate: Date, 
    endDate: Date, 
    maxDistance: number
  ): Promise<WalkWithDistance[]> {
    const walks = await this.getPlannedWalks();
    if (!userLocation) return [];
    console.log(userLocation);
    const walksWithDistance: WalkWithDistance[] = walks.filter(walk => {
        const walkDate = new Date(walk.dateTime);
        const distance = calculateDistance(userLocation, walk);
        return (
          walkDate >= new Date() &&
          (!startDate || walkDate >= startDate) &&
          (!endDate || walkDate <= endDate) &&
          distance <= maxDistance &&
          user.id !== walk.userId &&
          walk.cancelled === false &&
          !walk.joinedUserIds.includes(user.id)
        );
      }).map(walk => {
        const distance = calculateDistance(userLocation, walk);
        return {...walk, distance};
      })

    const sortedWalks = walksWithDistance.sort((a, b) => a.distance - b.distance);
    return sortedWalks;
  }

  async getUsersSortedByDistance(user: UserDetails, maxDistance: number): Promise<UserDetailsWithDistance[]> {
    const users = await this.getAllUsers();
    const usersWithDistance = users.map(otherUser => {
      const distance = haversineDistance(otherUser.latitude, otherUser.longitude, user.latitude, user.longitude);
      return {...otherUser, distance};
    });

    const sortedUsers = usersWithDistance.sort((a, b) => a.distance - b.distance);
    return sortedUsers.filter(u => u.distance <= maxDistance && u.id !== user.id);
  }
}



export { FireStoreDataProxy };
