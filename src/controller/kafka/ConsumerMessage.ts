/**
 * Created by msg on 20.01.17.
 */

class ConsumerMessage{

    private message: any;

    constructor(message: any){
        this.message = message;
    }

    getMessage(): any{
        return this.message;
    }
}

export {ConsumerMessage}