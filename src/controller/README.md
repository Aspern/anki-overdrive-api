# Controller Module

This module contains 2 components:

1. Console
2. Kafka

Before doing anything, first run 'npm install', so, it will download all dependencies for this module.

###Console:
This component will let you control car from command line. To initialize this module:

```javascript
let ankiConsole = new AnkiConsole();
ankiConsole.initializePrompt(vehicles);
```

where vehicles is the array of cars that you get by scanning. So, complete example is:

```javascript
let scanner = new VehicleScanner();
let ankiConsole = new AnkiConsole();

scanner.findAll().then((vehicles)=>{
    this.vehicles = vehicles;
    vehicles.forEach(function(vehicle, index) {
        console.log("use index " + index + " for car id: " + vehicle.id);
    });
    ankiConsole.initializePrompt(vehicles);
});
```

And when you run this code, you will get:

```
scanning vehicles...
use index 0 for car id: ef4ace474907
use index 1 for car id: d5255cd93a2b
>
```

Now, you can simply use index to invoke commands on car. For example, to connect to car, you can type 'c 0'. where is the command to connect.

To get all available commands, you can type 'help'.

###Kafka:
This component will initialize the kafka module, so you can send or receive messages via kafka.

First download and install kafka from kafka website. After installing the Kafka, you need to start the server and before that you need to start the zookeeper. So, to the start the zookeeper, first go to the installed directory and execute:

```
bin/zookeeper-server-start.sh config/zookeeper.properties
```

 And then start server:

```
bin/kafka-server-start.sh config/server.properties
```

After that, you need to create a topic, such as in this case “test”

```
bin/kafka-topics.sh --create --zookeeper localhost:2181 --replication-factor 1 --partitions 1 --topic test
```

To check whether topic is created, we can execute below command to list all the topics:

```
bin/kafka-topics.sh --list --zookeeper localhost:2181
```

Then we will start consumer and producer to send and receive data:

```
bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic test –from-beginning

bin/kafka-console-producer.sh --broker-list localhost:9092 --topic test
```

Now, to send a test message, we can use below command to send a message for the created topic, such as in our case “test”:

```
bin/kafka-console-producer.sh --broker-list localhost:9092 --topic test
```

Now we will initialize producer and consumer via our code. So for initializing the consumer:

```javascript
let kafka = new KafkaController('localhost:2181');

kafka.addListener((message: any) => {
    console.log(message);
}, ConsumerMessage);

kafka.initializeConsumer([{ topic: 'test', partition: 0 }]);
```

You can see we have initialize the listener before initializing the consumer. It is because, so we can receiving all the previous messages that are already stored in the kafka server.

and to initialize the producer, you can simply invoke this method:

```javascript
kafka.initializeProducer().then((isStarted: boolean)=> {
    isStarted ? kafka.sendPayload([ { topic: 'test', messages: "finally working again" , partitions: 1 }]): console.log('not started');
});
```

'kafka.sendPayload()' method will send the message to topic 'test'.
