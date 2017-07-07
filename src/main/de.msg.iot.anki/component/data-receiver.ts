import {LifecycleComponent} from "./lifecycle-component";

interface DataReceiver<D> extends LifecycleComponent{

    receive(callback: (data : D) => any) : void;

}

export {DataReceiver}