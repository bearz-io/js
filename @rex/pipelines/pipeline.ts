import type { ExecutionContext } from "@rex/primitives";

/**
 * Represents the next function in a pipeline.
 */
export type Next = () => Promise<void> | void;

/**
 * Represents a middleware function in a pipeline.
 */
export type RexMiddleware<C extends ExecutionContext = ExecutionContext> = <C>(
    ctx: C,
    next: Next,
) => void | Promise<void>;

/**
 * The base pipeline class that can be used to create a pipeline
 * that leverages middleware to process a context and unit of work
 * to produce a result.
 */
export abstract class Pipeline<O = void, C extends ExecutionContext = ExecutionContext> {
    #middlewares: ((ctx: C, next: Next) => void | Promise<void>)[];

    /**
     * Creates a new pipeline.
     */
    constructor() {
        this.#middlewares = [];
    }

    /**
     * Uses the specified middleware to run the pipeline.
     * @param middleware The middleware to use.
     * @returns A reference to the pipeline instance for chaining.
     */
    use(middleware: (ctx: C, next: Next) => void | Promise<void>): this {
        this.#middlewares.push(middleware);
        return this;
    }

    /**
     * Runs the pipeline.
     * @param ctx The context to run the pipeline with.
     * @returns The result of the pipeline.
     */
    abstract run(ctx: C): Promise<O>;

    /**
     * Runs the pipeline with the specified context by invoking each middleware
     * in order.
     * @param ctx The context to run the pipeline with.
     * @returns The context after the pipeline has been run.
     */
    protected async pipe(ctx: C): Promise<C> {
        let prevIndex = -1;

        // the first one added should be the first one run
        // so we reverse the array
        const ordered = this.#middlewares.slice().reverse();

        const runner = async (index: number, context: C): Promise<void> => {
            if (index === prevIndex) {
                throw new Error("next() called multiple times");
            }

            prevIndex = index;

            const middleware = ordered[index];

            if (middleware) {
                await middleware(context, () => {
                    return runner(index + 1, context);
                });
            }
        };

        await runner(0, ctx);
        return ctx;
    }
}
