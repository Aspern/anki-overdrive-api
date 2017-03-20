interface Scenario {

    start() : Promise<void>;

    interrupt() : Promise<void>;

}

export {Scenario}