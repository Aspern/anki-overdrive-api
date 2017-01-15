import {strictEqual} from "assert";
import {remove} from "fs-extra";
class KafkaController{

    private kafka: any;
    private producer: any;
    private client: any;
    private consumer: any;
    private isProducerReady: boolean = false;

    constructor(){
        this.kafka = require('kafka-node');
        this.client = new this.kafka.Client();
    }

    initializeProducer(): void{
        let Producer = this.kafka.Producer;
        this.producer = new Producer(this.client);
        this.producer.on('ready', ()=>{
            this.isProducerReady = true;
        });
    }

    initializeConsumer(clients: Array<any>): void{
        let Consumer = this.kafka.Consumer;
        this.consumer = new Consumer(clients, {autoCommit: false});
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