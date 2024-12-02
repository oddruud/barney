import { PlannedWalk } from '../types/PlannedWalk';
import { UserDetails } from '../types/UserDetails';

// Define the DataProxy interface
interface DataProxy {
    getPlannedWalks(): Promise<PlannedWalk[]>;
    addPlannedWalk(walk: PlannedWalk): Promise<void>;
    updatePlannedWalk(id: string, updatedWalk: Partial<PlannedWalk>): Promise<void>;
    deletePlannedWalk(id: string): Promise<void>;
    getLatestWalk(): Promise<PlannedWalk | null>;
    getUserDetailsById(id: number): Promise<UserDetails | null>;
  }

export { DataProxy };