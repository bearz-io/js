// Original source: https://github.com/tim-kos/node-retry
// Orgional source: https://github.com/sindresorhus/p-retry

import { isError, isNetworkError } from "@bearz/errors/utils"
import { AbortError } from "@bearz/errors/abort";
import { RetryOptions , RetryOperationOptions,  RequiredRetryOptions, RetryError, RetryOperation } from "./operation.ts";


export interface AsyncRetryOperationOptions extends RetryOperationOptions {
    shouldRetry?: (error: RetryError) => boolean | Promise<boolean>;
    onFailedAttempt?: (error : RetryError) => void | Promise<void>;
}

export function strategy(options?: RetryOperationOptions) : RetryOperation {
    const to = timeouts(options);
    return new RetryOperation(to, { 
        forever: options && (options.forever || options.retries === Infinity),
        unref: options && options.unref,
        maxRetryTime: options && options.maxRetryTime,
    })
}

function decororate(error: RetryError, attempt: number, options: RetryOperationOptions) {
    const remaining = options.retries! - (attempt - 1);

    error.attempt = attempt;
    error.retriesRemaining = remaining
    return error;
}

export function retry<T>(fn: (attempt: number) => Promise<T> | T, options?: AsyncRetryOperationOptions) {
    return new Promise<T>((resolve, reject) => {
        const o = {...options};
        o.retries ??= 10;
        o.shouldRetry ??= () => true;
        o.onFailedAttempt ??= () => Promise.resolve();

        const op = strategy(o);

        const abortHandler : () => void = () => {
            op.stop();
            reject(o.signal?.reason);
        };

        if (o.signal && !o.signal.aborted)  {
            o.signal.addEventListener("abort", abortHandler, { once: true });
        }

        const cleanup : () => void = () => {
            o.signal?.removeEventListener("abort", abortHandler);
            op.stop()
        }

        op.start(async (attempts) => {
            try {
               
                const r = fn(attempts);
                let result: T;
                if (r instanceof Promise) {
                    result = await r;
                } else {
                    result = r;
                }
                cleanup();
                resolve(result);
            } catch(error) {
                try {
                    if (!isError(error)) {
                        throw new TypeError("An error must be an instance of Error.");
                    }

                    if (AbortError.is(error)) {
                        if (error.cause && error.cause instanceof Error) {
                            throw error.cause;
                        }

                        throw error;
                    }

                    // if not a network error, throw it and stop retrying
                    if (error instanceof TypeError && !isNetworkError(error)) {
                        throw error;
                    }

                    // failed for some reason, retrying. 
                    const e = new RetryError(error, { cause: error });
                    decororate(e, attempts, o);

                    if (o.shouldRetry) {
                        const tmp = o.shouldRetry(e);
                        let shouldRetry: boolean;
                        if (tmp instanceof Promise) {
                            shouldRetry = await tmp;
                        } else {
                            shouldRetry = tmp;
                        }
    
                        if (!shouldRetry) {
                            op.stop();
                            reject(error);
                        }
                    }

                    if (o.onFailedAttempt) {
                        await o.onFailedAttempt(e);
                    }

                    if (!op.retry(e)) {
                        const err = op.error;
                        // if the operation's error exists throw it.
                        if (err) {
                            throw err;
                        }

                        // otherwise throw the original error as we've stopped retrying.
                        throw e;
                    }
                } catch (e) {
                    let ex : RetryError

                    if (!isError(e)) {
                        ex = new RetryError(`${e}`);
                    }

                    if (!(e instanceof RetryError)) {
                       ex = new RetryError(e as Error, { cause: e });
                    } else {
                        ex = e;
                    }

                    decororate(ex, attempts, o);
                    cleanup();
                    reject(ex);
                }
            }
        });
    });
}

export function timeouts(options?: RetryOptions | number[]) : number[] {
    if (Array.isArray(options)) {
        return new Array<number>().concat(options!);
    }

    const def : RequiredRetryOptions = {
        retries: 10,
        factor: 2,
        minTimeout: 1000,
        maxTimeout: Infinity,
        randomize: false
    };

    const o : RequiredRetryOptions = {
        ...def,
        ...options
    }

    if (o.minTimeout > o.maxTimeout)
        throw new RangeError("The minimum timeout must be less than the maximum timeout.");
    
    const timeouts : number[] = [];
    for (let i = 0; i < o.retries; i++) {
        timeouts.push(createTimeout(i, o));
    }

    if (options && options.forever && !timeouts.length) {
        timeouts.push(createTimeout(0, o));
    }

    timeouts.sort((a, b) => a - b);

    return timeouts;
}

export function createTimeout(attempt: number, options: RequiredRetryOptions) : number {
    const random = options?.randomize ? (Math.random() + 1) : 1;

    let timeout = Math.round(random * Math.max(options.minTimeout, 1) * Math.pow(options.factor, attempt));
    timeout = Math.min(timeout, options.maxTimeout);

    return timeout;
}

export function proxy<T extends object>(obj: T, options?: RetryOperationOptions, methods?: string[]) : T {

    if (!methods) {
        methods = [];
        for (const key in obj) {
            if (typeof obj[key] === "function") {
                methods.push(key);
            }
        }
    }

    const ph : ProxyHandler<T> = {
        // deno-lint-ignore no-explicit-any
        get(target: T, prop: string | symbol, receiver: any) {
            // deno-lint-ignore ban-types
            const og = Reflect.get(target, prop, receiver) as Function;
            if (typeof prop === 'string' && !methods.includes(prop)) {
                return og;
            }

            // deno-lint-ignore no-explicit-any
            return function(...args: any[]) {
                const strat = strategy(options);
                const cb = args.pop();

                args.push(function(err: Error) {
                    if (strat.retry(err)) {
                        return;
                    }

                    if (err) {
                        arguments[0] = strat.error;
                    }

                    if (cb)
                        cb.apply(target, arguments);
                })

                strat.start(function() {
                    return og.apply(target, args);
                })
            }.bind(target);
        }
    }

    return new Proxy(obj, ph);
}