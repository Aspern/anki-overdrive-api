import {isNullOrUndefined} from "util";
import {IConsumerListener} from "./IConsumerListener";

/**
 * TODO: Missing documentation
 */
class KafkaController implements IConsumerListener{

    private kafka: any;
    private producer: any;
    private client: any;
    private consumer: any;
    private producerConfig: any = '{' +
                                '// Configuration for when to consider a message as acknowledged, default 1 ' +
                                'requireAcks: 1, ' +
                                '// The amount of time in milliseconds to wait for all acks before considered, default 100ms ' +
                                'ackTimeoutMs: 0, ' +
                                '// Partitioner type (default = 0, random = 1, cyclic = 2, keyed = 3), default 0 ' +
                                'partitionerType: 2 ' +
                                '}';
    private _listeners: Array<{l: (message: any) => any, f: any}> = [];


    constructor(zookeeper = "localhost:2181"){
        this.kafka = require('kafka-node');
        this.client = new this.kafka.Client(zookeeper);;

    }

    initializeProducer(): Promise<boolean>{
        let Producer = this.kafka.Producer;
        this.producer = new Producer(this.client, this.producerConfig);
        return new Promise<boolean>((resolve) => {
            return this.producer.on('ready', function(){
                resolve(true);
            });
        });

    }

    initializeConsumer(clients: Array<any>, offset: number): void{
        let Consumer = this.kafka.Consumer;
        this.consumer = new Consumer(this.client, clients, {autoCommit: false});
        this.consumer.setOffset('test', 0, offset);
        this.consumer.on('message', (message: any) => {
            if (message)
                this._listeners.forEach((listener) => {
                    listener.l(message);
                });
        });
    }

    createProducerTopics(topics: Array<string>): any{
            this.producer.createTopics(topics, false, (err: any, data: any) => {
                err ? err : data;
            });
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

    sendPayload(payloads: Array<any>): Promise<any>{
        return new Promise<boolean>((resolve, reject) => {
            this.producer.send(payloads, (err: any, data: any)=>{
                if(err)
                    reject(err);
                else
                    resolve(data);
            })
        });
    }

    getAllTopics(): Promise<any>{
        return new Promise<any>((resolve, reject) => {
            this.client.loadMetadataForTopics([], function (error: any, results: any) {
                console.log(error);
                console.log(results);
                if(error)
                    reject(error);
                else
                    resolve(results);
            });
        });
    }

    addListener(listener: (message: any) => any, filter?: any): void {
        this._listeners.push({l: listener, f: filter});
    }

    removeListener(listener: (message: any) => any): void {
        for (var i = 0; i < this._listeners.length; ++i) {
            if (this._listeners[i].l === listener)
                this._listeners.splice(i, 1);
        }
    }

    close(): void{

    }
}
export {KafkaController}