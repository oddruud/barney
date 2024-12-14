import { LocationData } from '@/types/Location';
import { PlannedWalk } from '@/types/PlannedWalk';
import { RouteInfo } from '@/types/RouteInfo';
import { RewardInfo } from '@/types/RewardInfo';
import { fetchAddress } from '@/utils/geoUtils';

// Define the LocationData interface

class GenAIService {
    private static instance: GenAIService;
    private static serverUrl: string = 'http://roboruud.nl:8181';
    
    private constructor() {
        // Private constructor to prevent direct instantiation
    }

    public static getInstance(): GenAIService {
        if (!GenAIService.instance) {
            GenAIService.instance = new GenAIService();
        }
        return GenAIService.instance;
    }

    public static setServerUrl(url: string): void {
        GenAIService.serverUrl = url;
    }

    public async getRewardForWalk(walk: PlannedWalk): Promise<RewardInfo | null> {
        try {
            //retrieving reward
            const address = await fetchAddress(walk.latitude, walk.longitude);
            const addressString = `${address.title}, ${address.description}`;
            const url = `${GenAIService.serverUrl}/reward`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "location": addressString,
                    "intention": walk.description
                })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            try {
                const data = await response.json();
                const rewardInfo: RewardInfo = {
                    walkId: walk.id,
                    name: data.name,
                    description: data.description,
                    image: data.image
                };

                console.log("Reward info:", rewardInfo);
                
                return rewardInfo;
            } catch (error) {
                console.error('Error parsing JSON:', error);
                return null;
            }
        } catch (error) {
            console.error('Error posting location:', error);
            return null;
        }
        return null;
    }

    public async createRoute(latitude: number, longitude: number, address:string, duration: number): Promise<RouteInfo | null> {
        try {
            const url = `${GenAIService.serverUrl}/route`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    latitude,
                    longitude,
                    duration,
                    address
                })
            });

             if (!response.ok) {
                 throw new Error('Network response was not ok');
             }

            try {
                const data = await response.json();         
                const routeInfo: RouteInfo = {
                        route: data.route,
                        description: data.description,
                    };

                return routeInfo;
            } catch (error) {
                console.error('Error parsing JSON:', error);
                return null;
            }
            
        } catch (error) {
            console.error('Error posting location:', error);
            return null;
        }

        return null;
    }
}

export {GenAIService};
