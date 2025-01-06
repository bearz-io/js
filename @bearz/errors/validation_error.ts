export class ValidationError extends Error {
    constructor(message: string, options?: ErrorOptions) {
        super(message, options);
        this.name = "ValidationError";
    }
    
    static is(e: unknown): e is ValidationError {
        return e instanceof ValidationError;
    }

    rule?: string;

    value?: unknown;
}