export class EventEmitter<T> {
    nextId = 0;
    subscribers: { id: number, func: (value: T) => void }[] = []
    value: T

    subscribe(func: (value: T) => void) {
        const thisId = this.nextId;

        this.nextId += 1;

        if (this.value !== undefined) {
            func(this.value);
        }

        this.subscribers.push({ id: thisId, func });

        return () => { 
            this.subscribers = this.subscribers.filter(({ id }) => id !== thisId) 
        };
    }

    next(value: T) {
        this.value = value;

        this.subscribers.forEach(({ func }) => func(this.value));
    }
}