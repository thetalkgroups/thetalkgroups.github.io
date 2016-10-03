class EventEmitter {
    constructor() {
        this.nextId = 0;
        this.subscribers = [];
    }

    subscribe(func) {
        const thisId = this.nextId;

        this.nextId += 1;

        func(this.value);

        this.subscribers.push({ id: thisId, func });

        return () => { 
            this.subscribers = this.subscribers.filter(({ id }) => id !== thisId) 
        };
    }

    next(value) {
        this.value = value;

        this.subscribers.forEach(({ func }) => func(this.value));
    }
}