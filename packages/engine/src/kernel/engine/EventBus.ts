type EventHandler<T = any> = (data: T) => void;

export class EventBus {
    private listeners: Map<string, Set<EventHandler>> = new Map();

    subscribe<T>(event: string, handler: EventHandler<T>): () => void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event)!.add(handler);

        return () => {
            this.listeners.get(event)?.delete(handler);
        };
    }

    publish<T>(event: string, data?: T): void {
        const handlers = this.listeners.get(event);
        if (handlers) {
            handlers.forEach((handler) => {
                try {
                    handler(data);
                } catch (error) {
                    console.error(`Error in EventBus listener for "${event}":`, error);
                }
            });
        }
    }

    clear(): void {
        this.listeners.clear();
    }
}

export const eventBus = new EventBus();
