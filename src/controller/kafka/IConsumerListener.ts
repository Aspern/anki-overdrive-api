/**
 * Created by msg on 19.01.17.
 */

interface IConsumerListener {
    addListener(listener: (message: any) => any, filer?: any): void;
    removeListener(listener: (message: any) => any): void;
}
export {IConsumerListener}