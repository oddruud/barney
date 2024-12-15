class GlobalEventsEmitter {
    private static instance: GlobalEventsEmitter;
    private eventListenersMap: Map<string, Array<(...args: any[]) => void>>;

    private constructor() {

        this.eventListenersMap = new Map();
    }

    public static getInstance(): GlobalEventsEmitter {
        if (!GlobalEventsEmitter.instance) {
            GlobalEventsEmitter.instance = new GlobalEventsEmitter();
        }
        return GlobalEventsEmitter.instance;
    }

    public on(event: string, listener: (...args: any[]) => void): void {        
        if (!this.eventListenersMap.has(event)) {
            this.eventListenersMap.set(event, []);
        }

        if (this.eventListenersMap.get(event)?.includes(listener)) {
            return;
        }
        
        this.eventListenersMap.get(event)?.push(listener);
    }

    public off(event: string, listener: (...args: any[]) => void): void {  
        const listeners = this.eventListenersMap.get(event);
        if (listeners) {
            this.eventListenersMap.set(event, listeners.filter(l => l !== listener));
        }
    }

    public emit(event: string, ...args: any[]): void {
        const emitters = this.eventListenersMap.get(event);
        if (emitters) {
            emitters.forEach(emitter => emitter(...args));
        }
    }
}

export { GlobalEventsEmitter };