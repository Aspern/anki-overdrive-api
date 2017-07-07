import {LifecycleComponent} from "./lifecycle-component";
import {DataFilter} from "./data-filter";
import {DataReceiver} from "./data-receiver";
import {DataSender} from "./data-sender";

interface DataPipeline extends LifecycleComponent {

    addFilter<I, O>(filter: DataFilter<I, O>, index?: number): void;

    setReceiver<D>(receiver: DataReceiver<D>): void;

    setSender<D>(sender: DataSender<D>): void;

}

export {DataPipeline};