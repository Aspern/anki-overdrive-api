/// <reference path="../../decl/noble.d.ts"/>
import * as elasticsearch from "elasticsearch";
import {error} from "util";

class ElasticsearchPipeline {

    test() {
        let client = new elasticsearch.Client();

        client.search({
            index: 'test',
        }, (error, response) => {
            if (error)
                console.log(error);

            if (response)
                console.log(response);
        });
    }


}

export {ElasticsearchPipeline};