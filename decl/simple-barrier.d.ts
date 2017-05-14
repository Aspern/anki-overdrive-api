declare module "barrier" {

    export function waitOn(callback: (...args: any[]) => any): void;

    export function endWith(callback: (result: Array<any>) => any): void;

}