declare module "elasticsearch" {


    export class Client {

        constructor(config?: {host?: string});

        search(query: any, callback: (error: Error, response: any) => any): void;

        bulk(query: {body: [any]}, callback?: (error: Error, response: any) => any): void;

    }


}