import {suite, test, timeout} from "mocha-typescript";
import {expect} from "chai";
import {KafkaController} from "../../src/controller/kafka/kafkacontroller";

@suite
class KafkaControllerTest {

    @test @timeout(5000)"Initilaize kafka producer"(done: Function) {
        let kafka = new KafkaController('localhost:2181');

        kafka.initializeProducer().then((isStarted: boolean)=> {
            expect(isStarted).to.be.equal(true);
        }).catch((e) => done(e));
    }
}