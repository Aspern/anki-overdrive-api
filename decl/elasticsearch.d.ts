declare module "elasticsearch" {

    export class Client {

        constructor(config?: {
            host: string
        });

        bulk(body: {
            body: any
        }, callback: (error: Error, response: any) => any);
    }
}