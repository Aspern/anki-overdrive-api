import {LifecycleComponent} from "./lifecycle-component";

interface DataSender<D> extends  LifecycleComponent{

    send(data : D) : void;

}
export {DataSender}