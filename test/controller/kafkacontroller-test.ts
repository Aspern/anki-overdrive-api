import {suite, test, timeout} from "mocha-typescript";
import {expect} from "chai";
import {VehicleScanner} from "../../src/core/vehicle/vehicle-scanner";
import {Track} from "../../src/core/track/track-interface";
import {AnkiOverdriveTrack} from "../../src/core/track/anki-overdrive-track";
import {StraightPiece} from "../../src/core/track/straight-piece";
import {KafkaController} from "../../src/controller/kafka/kafkacontroller";
import {ConsumerMessage} from "../../src/controller/kafka/ConsumerMessage";

@suite
class KafkaControllerTest {

    static kafka: KafkaController;

    @timeout(5000)
    static before(done: Function) {
        KafkaControllerTest.kafka = new KafkaController('localhost:2181');
        done();
    }

    @test "kafka initialize producer and create topic"(done: Function) {
         KafkaControllerTest.kafka.initializeProducer().then((isStarted: boolean)=> {
             KafkaControllerTest.kafka.createProducerTopics(["test"]);
            done();
        }).catch((e) => done(e));
    }

    @test "kafka initialize consumer"(done: Function){
            KafkaControllerTest.kafka.addListener((message: any) => {
                if(message == "helloworld") done();
            }, ConsumerMessage);
            KafkaControllerTest.kafka.initializeConsumer([{ topic: 'test', partition: 0 }]);
            done();
    }

    @test "kafka send message"(done: Function){
        KafkaControllerTest.kafka.sendPayload([ { topic: 'cartest', messages: "helloworld" , partitions: 1 }]).catch((e) => done(e));
        done();
    }

}