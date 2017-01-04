declare module "elasticsearch" {

    export module Client {

        export class Client {

            constructor(config: {host?: string,});

            search(query: any, callback: (error: Error, response: any) => any): void;

        }

    }

}