export class EventEmitter {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    private events: Record<string, Function[]> = {};

    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    on(event: string, callback: Function){
        if(!this.events[event]) this.events[event] = [];
        this.events[event].push(callback);
    }

    emit(event: string, data?: unknown){
        if(this.events[event]){
            this.events[event].forEach((callback) => {
                callback(data);
            });
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    off(event: string, callback: Function) {
        if (this.events[event]) {
            this.events[event] = this.events[event].filter(cb => cb !== callback);
        }
    }
}