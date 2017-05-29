import {MongoClient} from "mongodb";
import {isNullOrUndefined} from "util";


MongoClient.connect("mongodb://localhost:27017/anki", (error, db) => {
    if (!isNullOrUndefined(error)) {
        console.error(error);
        process.exit();
    }

    let collection = db.collection("message-quality");


    collection.find({}).toArray((error, docs) => {

        let table: { [key: number]: Array<any> } = {};

        docs.forEach(doc => {

            let label = 0;


            if(doc.quality >= 0.98 && doc.quality <= 0.99)
                label = 1;

            collection.updateOne({
                    position: doc.position,
                    speed: doc.speed
                }
                , {
                    $set: {
                       label : label
                    }
                }, error => {
                    if (!isNullOrUndefined(error))
                        console.error(error);
                });

        });


        // if (table.hasOwnProperty(doc.speed))
        //     table[doc.speed].push(doc);
        // else
        //     table[doc.speed] = [doc];


        // let sortOrder: { [key: string]: number } = {
        //     "33:15": 0,
        //     "18:35": 1,
        //     "18:36": 2,
        //     "18:37": 3,
        //     "23:35": 4,
        //     "23:36": 5,
        //     "23:37": 6,
        //     "39:45": 7,
        //     "39:46": 8,
        //     "39:47": 9,
        //     "17:35": 10,
        //     "17:36": 11,
        //     "17:37": 12,
        //     "20:35": 13,
        //     "20:36": 14,
        //     "20:37": 15,
        //     "34:30": 16,
        //     "34:31": 17
        // };
        //
        // let printRow = "";
        // printRow += "speed\t";
        //
        // for (let key in sortOrder)
        //     if (sortOrder.hasOwnProperty(key))
        //         printRow += key + "\t";
        //
        // console.log(printRow);
        //
        //
        // for (let speed in table) {
        //
        //     printRow = "";
        //
        //     if (table.hasOwnProperty(speed)) {
        //         let data: Array<any> = table[speed];
        //
        //         for(let i = 0; i < data.length; i++)
        //             if(!sortOrder.hasOwnProperty(data[i].position))
        //                 data.splice(i, 1);
        //
        //         data = data.sort((a, b) => {
        //             return sortOrder[a.position] - sortOrder[b.position];
        //         });
        //
        //         printRow += speed + "\t";
        //         data.forEach(entry => {
        //             if (sortOrder.hasOwnProperty(entry.position))
        //                 printRow += entry.quality.toLocaleString() +"\t";
        //         });
        //
        //         console.log(printRow);
        //     }
        // }

        setTimeout(() => {
            db.close();
            process.exit();
        }, 10000);


        // collection.find({speed:830}).toArray((error, docs) => {
        //    docs.forEach(doc => {
        //        console.log(doc.position + "\t" + doc.quality);
        //    });
        //
        //     db.close();
        //     process.exit();
        // });
    });
});