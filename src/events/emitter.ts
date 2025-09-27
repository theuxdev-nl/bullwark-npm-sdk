export class EventEmitter {
    private events: Record<string, Function[]> = {};

    on(event: string, callback: Function){
        if(!this.events[event]) this.events[event] = [];
        this.events[event].push(callback);
    }

    emit(event: string, data?: any){
        if(this.events[event]){
            this.events[event].forEach((callback) => {
                callback(data);
            });
        }
    }

    off(event: string, callback: Function) {
        if (this.events[event]) {
            this.events[event] = this.events[event].filter(cb => cb !== callback);
        }
    }
}