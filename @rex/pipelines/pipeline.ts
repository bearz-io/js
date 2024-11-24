import type { ExecutionContext } from "@rex/primitives";

export type Next = () => Promise<void> | void;

export type RexMiddleware<C extends ExecutionContext = ExecutionContext> = <C>(
    ctx: C,
    next: Next,
) => void | Promise<void>;

export abstract class Pipeline<O = void, C extends ExecutionContext = ExecutionContext> {
    #middlewares: ((ctx: C, next: Next) => void | Promise<void>)[];

    constructor() {
        this.#middlewares = [];
    }

    use(middleware: (ctx: C, next: Next) => void | Promise<void>): this {
        this.#middlewares.push(middleware);
        return this;
    }

    abstract run(ctx: C): Promise<O>;

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
