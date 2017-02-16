/**
 * Active filters are self-running processes or threads. After their instantiation and initialization,
 * they are called from a higher-level program part and then started. From this point onwards they
 * are running continuously.
 */
interface ActiveFilter<IN,OUT> {

    /**
     * Initializes the filter with input data or a source from which it can process data.
     * The initialization must be done before the filter is started.
     *
     * @param input Input data
     */
    init(input: IN): void;

    /**
     * Starts the filtering process.
     *
     * @return Promise<void>
     */
    start(): Promise<void>;

    /**
     * Stops the filtering process.
     *
     * @return Promise<void>
     */
    stop(): Promise<void>;

    /**
     * Registers a listener, which is called upon each successful processing of the filter.
     *
     * @param listener Listener on successful processing results.
     */
    onUpdate(listener: (output: OUT) => any): void;

}

export {ActiveFilter};