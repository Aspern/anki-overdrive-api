declare module "jsonfile" {

    export function readFile(file: string, options?: any, callback?: (e: Error, obj: any) => any): void;

    export function readFileSync(file: String, options?: any): any;

    export function writeFile(file: string, obj: any, options?: any, callback?: (e: Error) => any): void;

    export function writeFileSync(file: string, obj:any, options?:any) : any;
}