export class EventEmitter {
    constructor() {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
        this.events = {};
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    on(event, callback) {
        if (!this.events[event])
            this.events[event] = [];
        this.events[event].push(callback);
    }
    emit(event, data) {
        if (this.events[event]) {
            this.events[event].forEach((callback) => {
                callback(data);
            });
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    off(event, callback) {
        if (this.events[event]) {
            this.events[event] = this.events[event].filter(cb => cb !== callback);
        }
    }
}
//# sourceMappingURL=emitter.js.map