/**
 * Provides methods to 'start' and 'stop' any kind of component. The methods are using Promises
 * to ensure, that eny kind of pre- or post-processing is finished before executing the component.
 */
interface LifecycleComponent {

    /**
     * Starts the component and resolves if necessary pre-processing is finished.
     *
     * @return Promise if pre-processing is finished
     */
    start(): Promise<void>;

    /**
     * Stops the component and resolves if necessary post-processing is finished.
     *
     * @return Promise if post-processing is finished
     */
    stop(): Promise<void>;

}

export {LifecycleComponent};