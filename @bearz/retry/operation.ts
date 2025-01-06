import { shimClearTimeout as clearTimeout, shimSetTimeout as setTimeout, type Timeout } from "./shims.ts";
import { TimeoutError } from "@bearz/errors/timeout"




export interface RetryOptions extends Record<string | symbol, unknown> {
    retries?: number;
    factor?: number;
    minTimeout?: number;
    maxTimeout?: number;
    randomize?: boolean;
}

export interface RequiredRetryOptions extends Record<string | symbol, unknown> {
    retries: number;
    factor: number;
    minTimeout: number;
    maxTimeout: number;
    randomize: boolean;
}

export interface RetryOperationOptions extends RetryOptions {
    signal?: AbortSignal;
    forever?: boolean;
    unref?: boolean;
    maxRetryTime?: number;
}

export interface TimeoutOptions extends Record<string | symbol, unknown> {
    timeout: number;
    callback?: () => void;
    signal?: AbortSignal;
}

export class RetryError extends Error {
    constructor(message: string | Error, options?: ErrorOptions) {
        super(typeof message === 'string' ? message : message.message, options);
        this.name = "RetryError";

        if (message instanceof Error) {
            this.cause = message;
            this.message = message.message;
        } else {
            const e = new Error(message);
            this.cause = e;
            e.stack = this.stack;
        }
    }

    attempt?: number;

    retriesRemaining?: number;
}

/**
 * Represents an operation that can be retried.
 */
export class RetryOperation {
    #timeouts: number[] = [];
    #options: RetryOperationOptions
    #signal?: AbortSignal;
    #originalTimeouts: number[] = [];
    #fn?: (attempts: number) => void;
    #operationTimeoutCb?: () => void;
    #maxRetryTime?: number;
    #errors: Error[] = [];
    #attempts = 1;
    #start?: number;
    #cachedTimeouts?: number[];
    #timeout?: number | Timeout;
    #timer?: number | Timeout;
    #operationTimeout?: number | Timeout;

    /**
     * Constructs a new `RetryOperation` instance.
     * @param timeouts The timeouts to use.
     * @param options The options to use.
     */
    constructor(timeouts: number[], options?: RetryOperationOptions) {
        this.#originalTimeouts = JSON.parse(JSON.stringify(timeouts));
        this.#timeouts = timeouts;
        this.#options = options ?? {} as RetryOperationOptions;
        this.#maxRetryTime = options && options.maxRetryTime || Infinity;
        this.#errors = [];

        if (this.#options.forever) {
            this.#cachedTimeouts = this.#timeouts.slice(0);
        }
    }

    /**
     * Gets the number of attempts that have been made.
     */
    get attempts() {
        return this.#attempts;
    }

    /**
     * Gets the errors that have occurred during the operation.
     */
    get errors() {
        return this.#errors;
    }

    /**
     * Gets the main error that caused the operation to fail.
     */
    get error() : Error | undefined {
        if (this.#errors.length === 0) {
            return undefined;
        }

        const counts : Record<string, number> = {};
        let error : Error | undefined = undefined;
        let errorCount = 0;

        for (let i = 0; i < this.#errors.length; i++) {
            const e = this.#errors[i];
            const msg = e.message;
            const count = (counts[msg] || 0) + 1;

            counts[msg] = count;

            if (count > errorCount) {
                errorCount = count;
                error = e;
            }
        }

        return error;
    }

    /**
     * Resets the operation.
     */
    reset() {
        this.#attempts = 1;
        this.#timeouts = this.#originalTimeouts.slice(0);
    }

    /**
     * Stops the operation.
     */
    stop() {
        if (this.#timeout) {
            clearTimeout(this.#timeout as number);
        }

        if (this.#timer) {
            clearTimeout(this.#timer);
        }

        this.#timeouts = [];
        this.#cachedTimeouts = undefined;
    }

    /**
     * Attempts to invoke the function for the first time.
     * 
     * @param fn The function to execute.
     * @param options The options to use.
     */
    start(fn: (attempts: number) => void, options?: TimeoutOptions) : void {
        this.#fn = fn;

        if (options) {
            if (options.timeout)
                this.#operationTimeout = options.timeout;
            
            if (options.callback)
                this.#operationTimeoutCb = options.callback;
        }

        if (this.#operationTimeoutCb) {
            this.#timeout = setTimeout(() => {
                this.#operationTimeoutCb!();
            }, this.#operationTimeout!);
        }

        this.#start = new Date().getTime();

        this.#fn(this.#attempts)
    }

    /**
     * 
     * @param error 
     * @returns 
     */
    retry(error?: Error) : boolean {
        if (this.#timeout) {
            clearTimeout(this.#timeout);
        }

        if (!error)
            return false 
        
        const ct = new Date().getTime();
        if (ct - this.#start! > this.#maxRetryTime!) {
            this.#errors.push(error);
            this.#errors.unshift(new TimeoutError("RetryOperation timed out."));
            return false;
        }

        this.#errors.push(error);

        let timeout = this.#timeouts.shift();
        if (timeout === undefined) {
            if (this.#cachedTimeouts && this.#cachedTimeouts.length > 0) {
                this.#errors.splice(0, this.#errors.length - 1);
                timeout = this.#cachedTimeouts.slice(-1)[0];
            } else {
                return false;
            }
        }

        this.#timer = setTimeout(() => {
            this.#attempts++;

            if (this.#operationTimeoutCb) {
                this.#timeout = setTimeout(() => {
                    this.#operationTimeoutCb!();
                }, this.#operationTimeout!);
            }

            if (this.#options.unref && this.#timeout && typeof this.#timeout !== "number") {
                this.#timeout.unref();
            }

            this.#fn!(this.#attempts);
        }, timeout);

        if (this.#options.unref && this.#timer && typeof this.#timer !== "number") {
            this.#timer.unref();
        }

        return true;
    }
}

