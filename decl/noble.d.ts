declare module "noble" {

    export var state: string;

    export function startScanning(serviceUuids?: Array<string>,
                                  allowDuplicates?: boolean,
                                  callback?: (p: any) => any): void;

    export function stopScanning(callback?: (p: any) => any): void;

    export function on(event: string, callback: (p: any) => any): void;

    export function removeListener(event: string, listener: (p: any) => any): void;

    export class Peripheral {

        public id: string;

        public uuid: string;

        public address: string;

        connect(callback?: (e: Error) => any): void;

        disconnect(callback?: (e: Error) => any): void;

        discoverAllServicesAndCharacteristics(callback?: (e: Error,
                                                          services: Array<Service>,
                                                          characteristics: Array<Characteristic>) => any): void;

        discoverServices(uuids: Array<string>, callback: (e: Error, services: Array<Service>) => any): void;
    }

    export class Service {
        public uuid: string;
    }

    export class Characteristic {

        public uuid: string;

        on(event: string, callback: (p: any) => any): void

        removeListener(event: string, listener: (p: any) => any): void;

        write(data: Buffer, withoutResponse?: boolean, callback?: (e: Error) => any) : void;

        subscribe(callback? : (e: Error) => any) : void;

    }

}