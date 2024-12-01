import { PlannedWalk } from '../types/PlannedWalk';
import { UserDetails } from '../types/UserDetails';
import { plannedWalks as dummyPlannedWalks, userDetails as dummyUserDetails } from './DummyData';
import { DataProxy } from './DataProxyInterface'; // Adjust the path as necessary

// Implement the DummyDataProxy class
class DummyDataProxy implements DataProxy {
  async getPlannedWalks(): Promise<PlannedWalk[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Fetching planned walks');
        resolve(dummyPlannedWalks);
      }, 500);
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
}
export { DummyDataProxy };