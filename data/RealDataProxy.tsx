import { PlannedWalk } from '../types/PlannedWalk';
import { UserDetails } from '../types/UserDetails';
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
    walks.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return walks[0];
  }

  async getUserDetailsById(id: number): Promise<UserDetails | null> {
    const response = await fetch(`/api/userDetails/${id}`);
    if (!response.ok) {
      return null;
    }
    return response.json();
  }
}

export { RealDataProxy };
