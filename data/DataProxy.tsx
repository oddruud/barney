import { PlannedWalk } from '../types/PlannedWalk';
import { UserDetails } from '../types/UserDetails';
import { plannedWalks as dummyPlannedWalks, userDetails as dummyUserDetails } from './DummyData';

const useDummyData = true; // Set this to false to use real API endpoints

const getPlannedWalks = async (): Promise<PlannedWalk[]> => {
  if (useDummyData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Fetching planned walks');
        resolve(dummyPlannedWalks);
      }, 500); // Simulate network delay
    });
  } else {
    // Replace with actual API call
    const response = await fetch('/api/plannedWalks');
    return response.json();
  }
};

const addPlannedWalk = async (walk: PlannedWalk): Promise<void> => {
  if (useDummyData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        dummyPlannedWalks.push(walk);
        resolve();
      }, 500); // Simulate network delay
    });
  } else {
    // Replace with actual API call
    await fetch('/api/plannedWalks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(walk),
    });
  }
};

const updatePlannedWalk = async (id: string, updatedWalk: Partial<PlannedWalk>): Promise<void> => {
  if (useDummyData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        dummyPlannedWalks = dummyPlannedWalks.map(walk => 
          walk.id === id ? { ...walk, ...updatedWalk } : walk
        );
        resolve();
      }, 500); // Simulate network delay
    });
  } else {
    // Replace with actual API call
    await fetch(`/api/plannedWalks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedWalk),
    });
  }
};

const deletePlannedWalk = async (id: string): Promise<void> => {
  if (useDummyData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        dummyPlannedWalks = dummyPlannedWalks.filter(walk => walk.id !== id);
        resolve();
      }, 500); // Simulate network delay
    });
  } else {
    // Replace with actual API call
    await fetch(`/api/plannedWalks/${id}`, {
      method: 'DELETE',
    });
  }
};

const getLatestWalk = async (): Promise<PlannedWalk | null> => {
  const walks = await getPlannedWalks();
  if (walks.length === 0) return null;

  // Assuming walks are sorted by date, otherwise sort them
  walks.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return walks[0];
};

const getUserDetailsById = async (id: number): Promise<UserDetails | null> => {
  if (useDummyData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = dummyUserDetails.find(user => user.id === id);
        resolve(user || null);
      }, 500); // Simulate network delay
    });
  } else {
    // Replace with actual API call
    const response = await fetch(`/api/userDetails/${id}`);
    if (!response.ok) {
      return null;
    }
    return response.json();
  }
};

export { getPlannedWalks, addPlannedWalk, updatePlannedWalk, deletePlannedWalk, getLatestWalk, getUserDetailsById };
