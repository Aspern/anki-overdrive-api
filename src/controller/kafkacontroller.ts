import {isNullOrUndefined} from "util";
class KafkaController{

    private kafka: any;
    private producer: any;
    private client: any;
    private consumer: any;
    private isProducerReady: boolean = false;
    private producerConfig: any = '{' +
                                '// Configuration for when to consider a message as acknowledged, default 1 ' +
                                'requireAcks: 1, ' +
                                '// The amount of time in milliseconds to wait for all acks before considered, default 100ms ' +
                                'ackTimeoutMs: 0, ' +
                                '// Partitioner type (default = 0, random = 1, cyclic = 2, keyed = 3), default 0 ' +
                                'partitionerType: 2 ' +
                                '}';

    constructor(zookeeper: string){
        zookeeper = isNullOrUndefined(zookeeper) ? 'localhost:2181' : zookeeper;
        this.kafka = require('kafka-node');
        this.client = new this.kafka.Client(zookeeper);
    }

    initializeProducer(): void{
        let Producer = this.kafka.Producer;
        this.producer = new Producer(this.client, this.producerConfig);
        this.producer.on('ready', ()=>{
            this.isProducerReady = true;
        });
    }

    initializeConsumer(clients: Array<any>): void{
        let Consumer = this.kafka.Consumer;
        this.consumer = new Consumer(this.client, clients, {autoCommit: false});
        this.consumer.on('message', (message: any) => {
            console.log(message);
        });
    }

    createProducerTopics(topics: Array<string>): any{
        if(this.isProducerReady) {
            this.producer.createTopics(topics, false, (err: any, data: any) => {
                console.log(err);
                console.log(data);
                err ? err : data;
            });
        }
        else console.log("producer is not ready");
    }

    addConsumerTopics(topics: Array<string>): void{
        this.consumer.addTopics(topics, (err: any, added: any) => {
            console.log(err);
            console.log(added);
        });
    }

    removeConsumerTopic(topics: Array<string>): void{
        this.consumer.removeTopics(['t1', 't2'], (err: any, removed: any) => {
            console.log(err);
            console.log(removed);
        });
    }

    sendPayload(payloads: Array<any>): any{
        this.isProducerReady ? this.producer.send(payloads, (err: any, data: any)=>{ err ? err: data;}) : console.log("producer is not ready");
    }

}
export {KafkaController}