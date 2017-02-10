interface Filter<T> {

    start() : Promise<void>;

    stop() : Promise<void>;

    onUpdate(handler: (data: T) => any): void;

}

export {Filter}