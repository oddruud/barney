import { LocationData } from '@/types/Location';
import { RouteInfo } from '@/types/RouteInfo';

// Define the LocationData interface

class SmartService {
    private static instance: SmartService;
    private static serverUrl: string = 'http://localhost:8080';


    

    private constructor() {
        // Private constructor to prevent direct instantiation
    }

    public static getInstance(): SmartService {
        if (!SmartService.instance) {
            SmartService.instance = new SmartService();
        }
        return SmartService.instance;
    }

    public static setServerUrl(url: string): void {
        SmartService.serverUrl = url;
    }

    public async createRoute(latitude: number, longitude: number, duration: number): Promise<RouteInfo | null> {
        try {
            const url = `${SmartService.serverUrl}/route`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    latitude,
                    longitude,
                    duration
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

// Usage
// SmartService.setServerUrl('https://your-server-url.com');
// const smartService = SmartService.getInstance();
// smartService.postRoute(12.34, 56.78, 90);

export {SmartService};
